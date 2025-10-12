from flask import Blueprint, jsonify, request, g, current_app
import sqlite3
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone 
import logging
import json
import random

from .db import query_db, execute_db, get_db 

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
        if not token: return jsonify({'message': '認証トークンがありません'}), 401
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            g.current_user_id = data.get('user_id')
            g.current_username = data.get('username')
            g.current_user_role = data.get('role', 'user')
            user_data = query_db('SELECT company_id FROM users WHERE id = ?', [g.current_user_id], one=True)
            g.current_user_company_id = user_data['company_id'] if user_data else None
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            return jsonify({'message': 'トークンが無効か期限切れです'}), 401
        except Exception as e:
            logger.error(f"認証エラー: {e}", exc_info=True)
            return jsonify({'message': '予期せぬエラーが発生しました'}), 500
        return f(*args, **kwargs)
    return decorated_function

def roles_required(roles):
    def decorator(f):
        from functools import wraps
        @wraps(f)
        @auth_required
        def decorated_function(*args, **kwargs):
            if not hasattr(g, 'current_user_role') or g.current_user_role not in roles:
                return jsonify({'message': 'この操作を行う権限がありません'}), 403
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

# --- 問題管理API (マスター・管理者用) ---

# [追加] 全ての問題を取得
@api_bp.route('/questions', methods=['GET'])
@roles_required(['master', 'admin'])
def get_questions():
    query = "SELECT id, genre, title, choices, answer, explanation FROM questions"
    params = []
    # 管理者の場合、自社作成の問題と共通問題のみ表示
    if g.current_user_role == 'admin':
        query += " WHERE company_id = ? OR company_id IS NULL"
        params.append(g.current_user_company_id)
    
    questions = query_db(query, params)
    return jsonify([dict(row) for row in questions])

# [追加] 特定の問題を取得 (編集用)
@api_bp.route('/questions/<int:question_id>', methods=['GET'])
@roles_required(['master', 'admin'])
def get_question(question_id):
    question = query_db("SELECT id, genre, title, choices, answer, explanation FROM questions WHERE id = ?", [question_id], one=True)
    if not question:
        return jsonify({'message': '問題が見つかりません'}), 404
    return jsonify(dict(question))

# 新しい問題を作成
@api_bp.route('/questions', methods=['POST'])
@roles_required(['master', 'admin'])
def create_question():
    data = request.get_json()
    genre, title, choices, answer = data.get('genre'), data.get('title'), data.get('choices'), data.get('answer')
    if not all([genre, title, choices, answer]):
        return jsonify({'message': '必須項目が不足しています'}), 400
    
    company_id = g.current_user_company_id if g.current_user_role == 'admin' else None
    try:
        execute_db("INSERT INTO questions (creator_id, company_id, genre, title, choices, answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?)",
                   [g.current_user_id, company_id, genre, title, choices, answer, data.get('explanation', '')])
        return jsonify({'message': '問題が作成されました'}), 201
    except sqlite3.Error as e:
        return jsonify({'message': f'データベースエラー: {e}'}), 500

# [追加] 問題を更新
@api_bp.route('/questions/<int:question_id>', methods=['PUT'])
@roles_required(['master', 'admin'])
def update_question(question_id):
    data = request.get_json()
    genre, title, choices, answer = data.get('genre'), data.get('title'), data.get('choices'), data.get('answer')
    if not all([genre, title, choices, answer]):
        return jsonify({'message': '必須項目が不足しています'}), 400
    
    execute_db("UPDATE questions SET genre = ?, title = ?, choices = ?, answer = ?, explanation = ? WHERE id = ?",
               [genre, title, choices, answer, data.get('explanation', ''), question_id])
    return jsonify({'message': '問題が更新されました'}), 200

# [追加] 問題を削除
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
            genres = [g.strip() for g in row['genre'].split(':') if g.strip()] 
            all_genres.update(genres)
        return jsonify(sorted(list(all_genres)))
    except sqlite3.Error as e:
        return jsonify({'message': f'データベースエラー: {e}'}), 500

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
    except sqlite3.Error as e:
        return jsonify({'message': f'データベースエラー: {e}'}), 500

@api_bp.route('/quiz/submit_answer', methods=['POST'])
@auth_required
def submit_answer():
    data = request.get_json()
    question_id, user_answer_list, session_id = data.get('question_id'), data.get('user_answer', []), data.get('session_id')
    if question_id is None or user_answer_list is None or session_id is None:
        return jsonify({'message': '必須データが不足しています'}), 400
        
    question = query_db("SELECT answer, explanation FROM questions WHERE id = ?", [question_id], one=True)
    if not question: return jsonify({'message': '問題が見つかりません'}), 404
    
    correct_answer_set = set(ans.strip() for ans in question['answer'].split(':') if ans.strip())
    user_answer_set = set(ans.strip() for ans in user_answer_list if ans.strip())
    is_correct = (user_answer_set == correct_answer_set)
    
    user_answer_str = json.dumps(user_answer_list, ensure_ascii=False)
    timestamp = datetime.now(timezone.utc).isoformat()
    
    try:
        execute_db("INSERT INTO results (user_id, question_id, session_id, user_answer, is_correct, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
                   [g.current_user_id, question_id, session_id, user_answer_str, is_correct, timestamp])
        return jsonify({'is_correct': is_correct, 'correct_answer': list(correct_answer_set), 'explanation': question['explanation']}), 200
    except sqlite3.Error as e:
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
    except sqlite3.Error as e:
        return jsonify({'message': f'データベースエラー: {e}'}), 500

# [追加] 全ユーザーの成績を取得 (管理者用)
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
    # 管理者の場合、自社のユーザーの結果のみ表示
    if g.current_user_role == 'admin':
        query += " WHERE u.company_id = ?"
        params.append(g.current_user_company_id)
    query += " ORDER BY r.timestamp DESC"
    
    try:
        results = query_db(query, params)
        return jsonify([dict(r) for r in results])
    except sqlite3.Error as e:
        return jsonify({'message': f'データベースエラー: {e}'}), 500

# --- ユーザー & 企業管理API ---

@api_bp.route('/admin/create_user', methods=['POST'])
@roles_required(['admin', 'master'])
def create_user():
    data = request.get_json()
    username, password, role = data.get('username'), data.get('password'), data.get('role', 'staff')
    
    if not all([username, password]): return jsonify({'message': 'ユーザー名とパスワードは必須です'}), 400
    if query_db('SELECT id FROM users WHERE username = ?', [username], one=True):
        return jsonify({'message': 'そのユーザー名は既に使用されています'}), 400
        
    company_id = None
    if g.current_user_role == 'admin':
        company_id = g.current_user_company_id
        if role not in ['staff', 'admin']:
            return jsonify({'message': '管理者はstaffまたはadmin権限のユーザーのみ作成できます'}), 403
        if not company_id: return jsonify({'message': '管理者が企業に紐付いていません'}), 400
    elif g.current_user_role == 'master':
        company_id = data.get('company_id') # マスターはリクエストで企業IDを指定できる
        if role == 'master':
             company_id = None # マスターはどの企業にも属さない
    
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    try:
        execute_db('INSERT INTO users (company_id, username, password_hash, role) VALUES (?, ?, ?, ?)', 
                   [company_id, username, hashed_password, role])
        return jsonify({'message': f'ユーザー {username} が {role} として作成されました'}), 201
    except sqlite3.Error as e:
        return jsonify({'message': f'データベースエラー: {e}'}), 500

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

# (その他のマスター用APIは変更なしのため省略)
# ...