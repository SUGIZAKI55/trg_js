from flask import Blueprint, jsonify, request, g, current_app
import sqlite3
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone 
import logging
import json
import random
import os

from .db import query_db, execute_db, get_db 
from .log_manager import log_w 

logger = logging.getLogger(__name__)
api_bp = Blueprint('api', __name__, url_prefix='/api')

# --- 認証/認可ヘルパー関数 ---
def auth_required(f):
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]
        if not token: return jsonify({'message': 'Authentication Token is missing!'}), 401
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            g.current_user_id = data.get('user_id')
            g.current_username = data.get('username')
            g.current_user_role = data.get('role', 'user')
            user_data = query_db('SELECT company_id FROM users WHERE id = ?', [g.current_user_id], one=True)
            g.current_user_company_id = user_data['company_id'] if user_data else None
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            return jsonify({'message': 'Token is invalid or expired!'}), 401
        except Exception as e:
            logger.error(f"Authentication error: {e}", exc_info=True)
            return jsonify({'message': 'An unexpected error occurred.'}), 500
        return f(*args, **kwargs)
    return decorated_function

def roles_required(roles):
    def decorator(f):
        from functools import wraps
        @wraps(f)
        @auth_required
        def decorated_function(*args, **kwargs):
            if not hasattr(g, 'current_user_role') or g.current_user_role not in roles:
                return jsonify({'message': 'Permission denied.'}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# --- 認証API ---
@api_bp.route('/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username, password = data.get('username'), data.get('password')
    if not all([username, password]): return jsonify({'message': 'ユーザー名とパスワードは必須です'}), 400
    if query_db('SELECT id FROM users WHERE username = ?', [username], one=True):
        return jsonify({'message': f'ユーザー {username} は既に使用されています'}), 400
    user_count_row = query_db('SELECT COUNT(id) as count FROM users', one=True)
    role = 'master' if user_count_row and user_count_row['count'] == 0 else 'user'
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    execute_db('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', [username, hashed_password, role])
    return jsonify({'message': 'ユーザーが作成されました'}), 201

@api_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username, password = data.get('username'), data.get('password')
    if not all([username, password]): return jsonify({'message': 'ユーザー名とパスワードは必須です'}), 400
    user = query_db('SELECT id, username, password_hash, role FROM users WHERE username = ?', [username], one=True)
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password_hash']):
        payload = { 'user_id': user['id'], 'username': user['username'], 'role': user['role'], 'exp': datetime.now(timezone.utc) + timedelta(hours=8) }
        token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')
        return jsonify({'token': token, 'username': user['username'], 'role': user['role']}), 200
    else:
        return jsonify({'message': '認証情報が無効です'}), 401

# --- 問題管理API ---
@api_bp.route('/questions', methods=['GET'])
@roles_required(['master', 'admin'])
def get_questions():
    query = "SELECT id, genre, title, choices, answer, explanation FROM questions"
    params = []
    if g.current_user_role == 'admin':
        query += " WHERE company_id = ? OR company_id IS NULL"
        params.append(g.current_user_company_id)
    questions = query_db(query, params)
    return jsonify([dict(row) for row in questions])

@api_bp.route('/questions/<int:question_id>', methods=['GET'])
@roles_required(['master', 'admin'])
def get_question(question_id):
    question = query_db("SELECT id, genre, title, choices, answer, explanation FROM questions WHERE id = ?", [question_id], one=True)
    if not question: return jsonify({'message': '問題が見つかりません'}), 404
    return jsonify(dict(question))

@api_bp.route('/questions', methods=['POST'])
@roles_required(['master', 'admin'])
def create_question():
    data = request.get_json()
    genre, title, choices, answer = data.get('genre'), data.get('title'), data.get('choices'), data.get('answer')
    if not all([genre, title, choices, answer]): return jsonify({'message': '必須項目が不足しています'}), 400
    company_id = g.current_user_company_id if g.current_user_role == 'admin' else None
    try:
        execute_db("INSERT INTO questions (creator_id, company_id, genre, title, choices, answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?)",
                   [g.current_user_id, company_id, genre, title, choices, answer, data.get('explanation', '')])
        return jsonify({'message': '問題が作成されました'}), 201
    except sqlite3.Error as e: return jsonify({'message': f'データベースエラー: {e}'}), 500

@api_bp.route('/questions/<int:question_id>', methods=['PUT'])
@roles_required(['master', 'admin'])
def update_question(question_id):
    data = request.get_json()
    genre, title, choices, answer = data.get('genre'), data.get('title'), data.get('choices'), data.get('answer')
    if not all([genre, title, choices, answer]): return jsonify({'message': '必須項目が不足しています'}), 400
    execute_db("UPDATE questions SET genre = ?, title = ?, choices = ?, answer = ?, explanation = ? WHERE id = ?",
               [genre, title, choices, answer, data.get('explanation', ''), question_id])
    return jsonify({'message': '問題が更新されました'}), 200

@api_bp.route('/questions/<int:question_id>', methods=['DELETE'])
@roles_required(['master', 'admin'])
def delete_question(question_id):
    execute_db("DELETE FROM questions WHERE id = ?", [question_id])
    return jsonify({'message': '問題が削除されました'}), 200

# --- クイズ実施API ---
@api_bp.route('/quiz/genres', methods=['GET'])
@auth_required
def get_quiz_genres():
    company_id = g.current_user_company_id
    query = "SELECT DISTINCT genre FROM questions WHERE company_id IS NULL"
    params = []
    if company_id:
        query += " OR company_id = ?"
        params.append(company_id)
    try:
        genres_rows = query_db(query, params)
        all_genres = set()
        for row in genres_rows:
            genres = [g.strip() for g in (row['genre'] or '').split(':') if g.strip()] 
            all_genres.update(genres)
        return jsonify(sorted(list(all_genres)))
    except sqlite3.Error as e: return jsonify({'message': f'データベースエラー: {e}'}), 500

@api_bp.route('/quiz/start', methods=['GET'])
@auth_required
def start_quiz():
    genre = request.args.get('genre')
    count = request.args.get('count', 10, type=int)
    if not genre: return jsonify({'message': 'ジャンル指定は必須です'}), 400
    search_genre = f"%{genre}%"
    company_id = g.current_user_company_id
    query = "SELECT id, title, choices, explanation FROM questions WHERE genre LIKE ? AND (company_id IS NULL"
    params = [search_genre]
    if company_id:
        query += " OR company_id = ?)"
        params.append(company_id)
    else:
        query += ")"
    try:
        available_questions = query_db(query, params)
        if not available_questions: return jsonify({'message': 'このジャンルの問題が見つかりません'}), 404
        selected_count = min(count, len(available_questions))
        questions_to_send = random.sample(available_questions, selected_count)
        return jsonify([dict(row) for row in questions_to_send])
    except sqlite3.Error as e: return jsonify({'message': f'データベースエラー: {e}'}), 500

@api_bp.route('/quiz/submit_answer', methods=['POST'])
@auth_required
def submit_answer():
    data = request.get_json()
    question_id = data.get('question_id')
    user_answer_list = data.get('user_answer', [])
    session_id = data.get('session_id')
    start_time_iso = data.get('start_time_iso')

    if question_id is None: return jsonify({'message': 'question_id がありません'}), 400
    question = query_db("SELECT answer, explanation, genre, title FROM questions WHERE id = ?", [question_id], one=True)
    if not question: return jsonify({'message': '問題が見つかりません'}), 404
    correct_answer_set = set(ans.strip() for ans in (question['answer'] or '').split(':') if ans.strip())
    user_answer_set = set(ans.strip() for ans in user_answer_list if ans.strip())
    is_correct = (user_answer_set == correct_answer_set)
    jst_now = datetime.now(timezone(timedelta(hours=9)))
    end_time = jst_now 
    start_time = None
    elapsed_time_sec = None
    if start_time_iso:
        try:
            start_time_utc = datetime.fromisoformat(start_time_iso.replace('Z', '+00:00'))
            start_time = start_time_utc.astimezone(timezone(timedelta(hours=9)))
            elapsed_time_sec = (end_time - start_time).total_seconds()
        except Exception as e: logger.warning(f"start_time_iso のパースに失敗: {e}")
    try:
        log_data = {
            "date": jst_now.strftime('%Y-%m-%d'),
            "name": g.current_username,
            "genre": question['genre'],
            "qmap": None, 
            "question_id": question_id,
            "question_title": question['title'],
            "start_time": start_time.strftime('%H:%M:%S') if start_time else None,
            "end_time": end_time.strftime('%H:%M:%S'),
            "elapsed_time": elapsed_time_sec,
            "user_choice": user_answer_list,
            "correct_answers": list(correct_answer_set),
            "result": "正解" if is_correct else f"不正解。正しい答えは: {', '.join(correct_answer_set)}",
            "kaisetsu": question['explanation']
        }
        log_w(log_data)
    except Exception as e: logger.error(f"ログの生成または書き込みに失敗しました: {e}", exc_info=True)
    try:
        user_answer_str = json.dumps(user_answer_list, ensure_ascii=False)
        utc_timestamp_str = datetime.now(timezone.utc).isoformat()
        execute_db("INSERT INTO results (user_id, question_id, session_id, user_answer, is_correct, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
                   [g.current_user_id, question_id, session_id, user_answer_str, is_correct, utc_timestamp_str])
        return jsonify({'is_correct': is_correct, 'correct_answer': list(correct_answer_set), 'explanation': question['explanation']}), 200
    except sqlite3.Error as e:
        logger.error(f"DB保存中にエラーが発生: {e}", exc_info=True)
        return jsonify({'message': f'結果の保存に失敗しました: {e}'}), 500

# --- 成績・結果取得API ---
@api_bp.route('/user/my_results', methods=['GET'])
@auth_required
def get_my_results():
    try:
        results = query_db("""
            SELECT session_id, is_correct, timestamp, q.title 
            FROM results r JOIN questions q ON r.question_id = q.id
            WHERE r.user_id = ? ORDER BY r.timestamp DESC
        """, [g.current_user_id])
        return jsonify([dict(r) for r in results])
    except sqlite3.Error as e: return jsonify({'message': f'データベースエラー: {e}'}), 500

@api_bp.route('/admin/results', methods=['GET'])
@roles_required(['master', 'admin'])
def get_all_results():
    query = """
        SELECT r.session_id, r.is_correct, r.timestamp, u.username, c.name as company_name
        FROM results r
        JOIN users u ON r.user_id = u.id
        LEFT JOIN companies c ON u.company_id = c.id
    """
    params = []
    if g.current_user_role == 'admin':
        query += " WHERE u.company_id = ?"
        params.append(g.current_user_company_id)
    query += " ORDER BY r.timestamp DESC"
    try:
        results = query_db(query, params)
        return jsonify([dict(r) for r in results])
    except sqlite3.Error as e: return jsonify({'message': f'データベースエラー: {e}'}), 500

# --- ユーザー & 企業管理API ---
@api_bp.route('/admin/create_user', methods=['POST'])
@roles_required(['admin', 'master'])
def create_user():
    data = request.get_json()
    username, password, role = data.get('username'), data.get('password'), data.get('role', 'staff')
    if not all([username, password]): return jsonify({'message': 'ユーザー名とパスワードは必須です'}), 400
    if query_db('SELECT id FROM users WHERE username = ?', [username], one=True): return jsonify({'message': 'そのユーザー名は既に使用されています'}), 400
    company_id = None
    if g.current_user_role == 'admin':
        company_id = g.current_user_company_id
        if role not in ['staff', 'admin']: return jsonify({'message': '管理者はstaffまたはadmin権限のユーザーのみ作成できます'}), 403
        if not company_id: return jsonify({'message': '管理者が企業に紐付いていません'}), 400
    elif g.current_user_role == 'master':
        company_id = data.get('company_id')
        if role == 'master': company_id = None
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    try:
        execute_db('INSERT INTO users (company_id, username, password_hash, role) VALUES (?, ?, ?, ?)', 
                   [company_id, username, hashed_password, role])
        return jsonify({'message': f'ユーザー {username} が {role} として作成されました'}), 201
    except sqlite3.Error as e: return jsonify({'message': f'データベースエラー: {e}'}), 500

@api_bp.route('/admin/users', methods=['GET'])
@roles_required(['master', 'admin'])
def get_users():
    query = "SELECT u.id, u.username, u.role, u.created_at, c.name as company_name FROM users u LEFT JOIN companies c ON u.company_id = c.id"
    params = []
    if g.current_user_role == 'admin':
        query += " WHERE u.company_id = ?"
        params.append(g.current_user_company_id)
    users = query_db(query, params)
    return jsonify([dict(row) for row in users])

@api_bp.route('/master/register_company', methods=['POST'])
@roles_required(['master'])
def register_company():
    data = request.get_json()
    company_name, admin_username, admin_password = data.get('company_name'), data.get('admin_username'), data.get('admin_password')
    if not all([company_name, admin_username, admin_password]): return jsonify({'message': '全ての項目を入力してください'}), 400
    if query_db('SELECT id FROM companies WHERE name = ?', [company_name], one=True): return jsonify({'message': 'その企業名は既に使用されています'}), 400
    if query_db('SELECT id FROM users WHERE username = ?', [admin_username], one=True): return jsonify({'message': 'その管理者ユーザー名は既に使用されています'}), 400
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute('INSERT INTO companies (name) VALUES (?)', [company_name])
        new_company_id = cursor.lastrowid
        hashed_password = bcrypt.hashpw(admin_password.encode('utf-8'), bcrypt.gensalt())
        cursor.execute('INSERT INTO users (company_id, username, password_hash, role) VALUES (?, ?, ?, ?)', [new_company_id, admin_username, hashed_password, 'admin'])
        db.commit()
        return jsonify({'message': '企業と管理者ユーザーが作成されました'}), 201
    except sqlite3.Error as e:
        get_db().rollback()
        return jsonify({'message': f'データベースエラー: {e}'}), 500

@api_bp.route('/admin/logs', methods=['GET'])
@roles_required(['master', 'admin'])
def get_logs():
    log_file_path = current_app.config.get('LOG_FILE_PATH')
    logs = []
    if not log_file_path or not os.path.exists(log_file_path): return jsonify([{'level': 'ERROR', 'message': 'ログファイルが見つかりません。'}])
    try:
        with open(log_file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            for line in lines:
                try: logs.append(json.loads(line))
                except json.JSONDecodeError: logs.append({'time': 'N/A', 'level': 'RAW', 'message': line.strip()})
        return jsonify(logs[::-1][:100])
    except Exception as e: return jsonify([{'level': 'ERROR', 'message': f'ログの読み込みに失敗しました: {e}'}]), 500

# --- 新規API 1: ダッシュボード用データ取得 ---
@api_bp.route('/user/dashboard_data', methods=['GET'])
@auth_required
def get_dashboard_data():
    try:
        query = """
            SELECT q.genre, COUNT(*) as total, SUM(CASE WHEN r.is_correct THEN 1 ELSE 0 END) as correct
            FROM results r
            JOIN questions q ON r.question_id = q.id
            WHERE r.user_id = ?
            GROUP BY q.genre
        """
        stats_rows = query_db(query, [g.current_user_id])
        genre_stats = {}
        for row in stats_rows:
            genre = row['genre']
            total = row['total']
            correct = row['correct']
            accuracy = (correct / total) * 100 if total > 0 else 0
            genre_stats[genre] = round(accuracy, 1)
        
        seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
        review_query = """
            SELECT COUNT(DISTINCT question_id) as count
            FROM results
            WHERE user_id = ? AND is_correct = 0 AND timestamp > ?
        """
        review_count_row = query_db(review_query, [g.current_user_id, seven_days_ago], one=True)
        review_count = review_count_row['count'] if review_count_row else 0
        return jsonify({'genre_stats': genre_stats, 'review_count': review_count})
    except sqlite3.Error as e: return jsonify({'message': f'Database error: {e}'}), 500

# --- 新規API 2: 復習クイズ開始 ---
@api_bp.route('/quiz/review', methods=['GET'])
@auth_required
def start_review_quiz():
    try:
        seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
        query = """
            SELECT DISTINCT q.id, q.title, q.choices, q.explanation 
            FROM results r
            JOIN questions q ON r.question_id = q.id
            WHERE r.user_id = ? AND r.is_correct = 0 AND r.timestamp > ?
        """
        review_questions = query_db(query, [g.current_user_id, seven_days_ago])
        if not review_questions: return jsonify({'message': '復習対象の問題はありません。'}), 404
        selected_count = min(10, len(review_questions))
        questions_to_send = random.sample(review_questions, selected_count)
        return jsonify([dict(row) for row in questions_to_send])
    except sqlite3.Error as e: return jsonify({'message': f'Database error: {e}'}), 500

# --- 新規API 3: 弱点克服クイズ開始 ---
@api_bp.route('/quiz/weak_start', methods=['GET'])
@auth_required
def start_weak_quiz():
    try:
        query = """
            SELECT DISTINCT q.id, q.title, q.choices, q.explanation 
            FROM results r
            JOIN questions q ON r.question_id = q.id
            WHERE r.user_id = ? AND r.is_correct = 0
        """
        weak_questions = query_db(query, [g.current_user_id])
        if not weak_questions: return jsonify({'message': '弱点となる問題は見つかりませんでした。'}), 404
        selected_count = min(10, len(weak_questions))
        questions_to_send = random.sample(weak_questions, selected_count)
        return jsonify([dict(row) for row in questions_to_send])
    except sqlite3.Error as e: return jsonify({'message': f'Database error: {e}'}), 500

# --- 新規API 4: 自信回復(ウォームアップ)クイズ開始 ---
@api_bp.route('/quiz/start_easy', methods=['GET'])
@auth_required
def start_easy_quiz():
    genre = request.args.get('genre')
    count = request.args.get('count', 10, type=int)
    try:
        query = """
            SELECT q.id, q.title, q.choices, q.explanation, 
                   COALESCE(AVG(r.is_correct), 0) as accuracy
            FROM questions q
            LEFT JOIN results r ON q.id = r.question_id
            WHERE 1=1
        """
        params = []
        if genre:
            query += " AND q.genre LIKE ?"
            params.append(f"%{genre}%")
        query += """
            GROUP BY q.id
            ORDER BY accuracy DESC, q.id ASC
            LIMIT ?
        """
        params.append(count)
        questions = query_db(query, params)
        if not questions: return jsonify({'message': '問題が見つかりませんでした。'}), 404
        return jsonify([dict(row) for row in questions])
    except sqlite3.Error as e: return jsonify({'message': f'Database error: {e}'}), 500

# --- 追加: 自分の詳細分析用データ取得API ---
@api_bp.route('/user/analysis_data', methods=['GET'])
@auth_required
def get_my_analysis_data():
    try:
        query = """
            SELECT r.is_correct, r.timestamp, q.genre, q.title 
            FROM results r
            JOIN questions q ON r.question_id = q.id
            WHERE r.user_id = ?
            ORDER BY r.timestamp ASC
        """
        rows = query_db(query, [g.current_user_id])
        log_file_path = current_app.config.get('LOG_FILE_PATH')
        my_logs = []
        if log_file_path and os.path.exists(log_file_path):
            with open(log_file_path, 'r', encoding='utf-8') as f:
                for line in f:
                    try:
                        log = json.loads(line)
                        if log.get('name') == g.current_username:
                            my_logs.append(log)
                    except: pass
        return jsonify(my_logs)
    except Exception as e: return jsonify({'message': f'Error: {e}'}), 500

# --- 追加: パスワードリセットAPI ---
@api_bp.route('/admin/reset_password', methods=['POST'])
@roles_required(['master', 'admin'])
def reset_user_password():
    data = request.get_json()
    target_user_id = data.get('user_id')
    new_password = data.get('new_password')
    if not target_user_id or not new_password: return jsonify({'message': 'ユーザーIDと新しいパスワードが必要です'}), 400
    if g.current_user_role == 'admin':
        target = query_db('SELECT company_id FROM users WHERE id = ?', [target_user_id], one=True)
        if not target or target['company_id'] != g.current_user_company_id: return jsonify({'message': '権限がありません'}), 403
    hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
    try:
        execute_db('UPDATE users SET password_hash = ? WHERE id = ?', [hashed_password, target_user_id])
        return jsonify({'message': 'パスワードを変更しました'}), 200
    except sqlite3.Error as e: return jsonify({'message': f'Database error: {e}'}), 500

# --- 追加: ユーザー一括登録API (修正済み: 企業名対応) ---
@api_bp.route('/admin/bulk_users', methods=['POST'])
@roles_required(['master', 'admin'])
def bulk_register_users():
    data = request.get_json()
    csv_text = data.get('csv_text', '')
    
    success_count = 0
    errors = []
    
    lines = csv_text.strip().split('\n')
    for i, line in enumerate(lines):
        parts = [p.strip() for p in line.split(',')]
        
        if len(parts) < 2:
            errors.append(f"行 {i+1}: フォーマット不正")
            continue
            
        username = parts[0]
        password = parts[1]
        role = parts[2] if len(parts) > 2 and parts[2] else 'staff'
        company_name_input = parts[3] if len(parts) > 3 and parts[3] else None
        
        if query_db('SELECT id FROM users WHERE username = ?', [username], one=True):
            errors.append(f"行 {i+1}: ユーザー {username} は既に存在します")
            continue
            
        company_id = None
        
        if g.current_user_role == 'admin':
            company_id = g.current_user_company_id
        elif g.current_user_role == 'master':
            if company_name_input:
                company = query_db('SELECT id FROM companies WHERE name = ?', [company_name_input], one=True)
                if company:
                    company_id = company['id']
                else:
                    errors.append(f"行 {i+1}: 企業 '{company_name_input}' が見つかりません")
                    continue
            else:
                company_id = None

        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        try:
            execute_db('INSERT INTO users (company_id, username, password_hash, role) VALUES (?, ?, ?, ?)', 
                       [company_id, username, hashed, role])
            success_count += 1
        except Exception as e:
            errors.append(f"行 {i+1}: エラー {e}")

    return jsonify({
        'message': f'{success_count} 件登録しました',
        'errors': errors
    })

# --- 追加: 企業一括登録API ---
@api_bp.route('/master/bulk_companies', methods=['POST'])
@roles_required(['master'])
def bulk_register_companies():
    data = request.get_json()
    csv_text = data.get('csv_text', '')
    success_count = 0
    errors = []
    lines = csv_text.strip().split('\n')
    for i, line in enumerate(lines):
        company_name = line.strip()
        if not company_name: continue
        if query_db('SELECT id FROM companies WHERE name = ?', [company_name], one=True):
            errors.append(f"行 {i+1}: 企業 {company_name} は既に存在します")
            continue
        try:
            execute_db('INSERT INTO companies (name) VALUES (?)', [company_name])
            success_count += 1
        except Exception as e: errors.append(f"行 {i+1}: エラー {e}")
    return jsonify({'message': f'{success_count} 社登録しました', 'errors': errors})

# ★★★ 追加: ユーザーの所属企業を変更するAPI ★★★
@api_bp.route('/admin/update_user_company', methods=['POST'])
@roles_required(['master']) # 企業変更はマスター権限のみ許可（Adminは自社しか管理できないため）
def update_user_company():
    data = request.get_json()
    user_id = data.get('user_id')
    company_name = data.get('company_name') # 企業名で指定 (""なら無所属)
    
    if not user_id:
        return jsonify({'message': 'ユーザーIDが必要です'}), 400

    company_id = None
    if company_name:
        company = query_db('SELECT id FROM companies WHERE name = ?', [company_name], one=True)
        if not company:
            return jsonify({'message': f'企業 "{company_name}" が見つかりません'}), 404
        company_id = company['id']
    
    try:
        execute_db('UPDATE users SET company_id = ? WHERE id = ?', [company_id, user_id])
        
        # 結果メッセージを作成
        status = f"所属を '{company_name}' に変更しました" if company_name else "所属を解除しました"
        return jsonify({'message': status}), 200
        
    except sqlite3.Error as e:
        return jsonify({'message': f'Database error: {e}'}), 500
    
# ★★★ 追加: 企業一覧取得API (プルダウン用) ★★★
@api_bp.route('/master/companies', methods=['GET'])
@roles_required(['master'])
def get_companies_list():
    try:
        companies = query_db("SELECT id, name FROM companies ORDER BY name")
        return jsonify([dict(row) for row in companies])
    except sqlite3.Error as e:
        return jsonify({'message': f'Database error: {e}'}), 500