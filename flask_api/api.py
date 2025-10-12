from flask import Blueprint, jsonify, request, g, current_app
import sqlite3
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone 
import logging
import json
import random

# .dbモジュールから必要な関数をインポート
# get_db はトランザクション管理のために残す
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
    if not all([username, password]): return jsonify({'message': 'Username and password are required'}), 400
    if query_db('SELECT id FROM users WHERE username = ?', [username], one=True):
        return jsonify({'message': f'User {username} already exists'}), 400
    
    # 最初のユーザーはマスターとして登録
    user_count_row = query_db('SELECT COUNT(id) as count FROM users', one=True)
    user_count = user_count_row['count'] if user_count_row else 0
    role = 'master' if user_count == 0 else 'user'
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    execute_db('INSERT INTO users (username, password_hash, role, company_id) VALUES (?, ?, ?, ?)', [username, hashed_password, role, None])
    return jsonify({'message': 'User created'}), 201

@api_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username, password = data.get('username'), data.get('password')
    if not all([username, password]): return jsonify({'message': 'Username and password are required'}), 400
    user = query_db('SELECT id, username, password_hash, role FROM users WHERE username = ?', [username], one=True)
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password_hash']):
        payload = { 'user_id': user['id'], 'username': user['username'], 'role': user['role'], 'exp': datetime.now(timezone.utc) + timedelta(hours=8) }
        token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')
        return jsonify({'token': token, 'username': user['username'], 'role': user['role']}), 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

# --- 問題管理API (マスター・管理者用) ---
@api_bp.route('/questions', methods=['POST'])
@roles_required(['master', 'admin'])
def create_question():
    data = request.get_json()
    genre, title, choices, answer = data.get('genre'), data.get('title'), data.get('choices'), data.get('answer')
    if not all([genre, title, choices, answer]):
        return jsonify({'message': 'Genre, Title, Choices, and Answer are required'}), 400
    
    company_id = g.current_user_company_id if g.current_user_role == 'admin' else None
    try:
        execute_db("INSERT INTO questions (creator_id, company_id, genre, title, choices, answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?)",
                   [g.current_user_id, company_id, genre, title, choices, answer, data.get('explanation', '')])
        return jsonify({'message': 'Question created successfully'}), 201
    except sqlite3.Error as e:
        return jsonify({'message': f'Database error: {e}'}), 500

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
            # データベースの問題データがジャンルを ':' 区切りで保持している可能性を考慮
            genres = [g.strip() for g in row['genre'].split(':') if g.strip()] 
            all_genres.update(genres)
        return jsonify(sorted(list(all_genres)))
    except sqlite3.Error as e:
        return jsonify({'message': f'Database error: {e}'}), 500

@api_bp.route('/quiz/start', methods=['GET'])
@auth_required
def start_quiz():
    genre = request.args.get('genre')
    count = request.args.get('count', type=int)
    if not all([genre, count]):
        return jsonify({'message': 'Genre and count parameters are required'}), 400
    
    # ジャンルに部分一致する問題を検索
    search_genre = f"%{genre}%"

    company_id = g.current_user_company_id
    query = "SELECT id, title, choices, explanation FROM questions WHERE genre LIKE ? AND (company_id IS NULL"
    params = [search_genre]
    if company_id:
        query += " OR company_id = ?)"
        params.append(company_id)
    else:
        query += ")"
    
    # データを取得し、ランダムに選択
    try:
        available_questions = query_db(query, params)
        if not available_questions: return jsonify({'message': 'No questions found for this genre.'}), 404
        
        selected_count = min(count, len(available_questions))
        questions_to_send = random.sample(available_questions, selected_count)
        return jsonify([dict(row) for row in questions_to_send])
    except sqlite3.Error as e:
        return jsonify({'message': f'Database error: {e}'}), 500

@api_bp.route('/quiz/submit_answer', methods=['POST'])
@auth_required
def submit_answer():
    data = request.get_json()
    question_id = data.get('question_id')
    user_answer_list = data.get('user_answer', [])
    session_id = data.get('session_id') # フロントエンドから渡されるセッションID

    if question_id is None or user_answer_list is None or session_id is None:
        return jsonify({'message': 'question_id, user_answer, and session_id are required'}), 400
        
    question = query_db("SELECT answer, explanation FROM questions WHERE id = ?", [question_id], one=True)
    if not question: return jsonify({'message': 'Question not found'}), 404
    
    # 正解とユーザー解答をセットで比較して判定（順序を無視し、内容が完全に一致するか）
    correct_answer_set = set(ans.strip() for ans in question['answer'].split(':') if ans.strip())
    user_answer_set = set(ans.strip() for ans in user_answer_list if ans.strip())
    is_correct = (user_answer_set == correct_answer_set)
    
    user_answer_str = json.dumps(user_answer_list, ensure_ascii=False)
    timestamp = datetime.now(timezone.utc).isoformat()
    
    try:
        # results テーブルに解答結果を保存
        execute_db("INSERT INTO results (user_id, question_id, session_id, user_answer, is_correct, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
                   [g.current_user_id, question_id, session_id, user_answer_str, is_correct, timestamp])
                   
        return jsonify({
            'is_correct': is_correct, 
            'correct_answer': list(correct_answer_set), 
            'explanation': question['explanation'],
            'user_answer': user_answer_list
        }), 200
    except sqlite3.Error as e:
        return jsonify({'message': f'Failed to save result: {e}'}), 500

# --- ユーザー成績取得API (/my_results に対応) ---
@api_bp.route('/user/my_results', methods=['GET'])
@auth_required
def get_my_results():
    """ログインユーザーのすべての解答履歴を取得 (session_idを含む)"""
    try:
        # resultsテーブルにsession_idとtimestampが格納されている前提で修正
        results = query_db("""
            SELECT 
                r.session_id, 
                r.is_correct, 
                r.timestamp,
                q.title 
            FROM results r
            JOIN questions q ON r.question_id = q.id
            WHERE r.user_id = ?
            ORDER BY r.timestamp DESC
        """, [g.current_user_id])
        
        return jsonify([dict(r) for r in results])
    except sqlite3.Error as e:
        return jsonify({'message': f'Database error on my_results: {e}'}), 500


# --- ユーザー & 企業管理API ---

# ★ 修正箇所: /api/admin/create_user の実装を、フロントエンドの要求通りに修正 ★
@api_bp.route('/admin/create_user', methods=['POST'])
@roles_required(['admin'])
def create_user():
    data = request.get_json()
    username, password, role = data.get('username'), data.get('password'), data.get('role', 'user') # roleを受け取る
    
    if not all([username, password]): return jsonify({'message': 'Username and password are required'}), 400
    if query_db('SELECT id FROM users WHERE username = ?', [username], one=True):
        return jsonify({'message': 'Username already exists'}), 400
        
    company_id = g.current_user_company_id
    
    # 管理者がマスターユーザーを作成しようとした場合の制限
    if role == 'master' and g.current_user_role != 'master':
        return jsonify({'message': 'Permission denied: Only master users can create master accounts.'}), 403

    if g.current_user_role == 'admin':
        # Adminは自分の会社内で、staffまたはadmin（同じロール）を作成可能
        if role == 'user':
            role = 'staff' # フロントエンドの'staff'オプションに対応
        elif role != 'staff' and role != 'admin':
            return jsonify({'message': 'Admin users can only create staff or admin roles.'}), 403
            
        if not company_id: return jsonify({'message': 'Admin is not associated with a company.'}), 400
        
    # マスターユーザーは company_id が None のまま、任意のロールを作成可能
    elif g.current_user_role == 'master':
        company_id = data.get('company_id', None) # マスターは会社IDを任意で設定可能
        
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    try:
        execute_db('INSERT INTO users (company_id, username, password_hash, role) VALUES (?, ?, ?, ?)', [company_id, username, hashed_password, role])
        return jsonify({'message': f'User {username} created successfully as {role}'}), 201
    except sqlite3.Error as e:
        return jsonify({'message': f'Database error occurred: {e}'}), 500

# --- 既存のAPIルート（変更なし） ---
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
    if not all([company_name, admin_username, admin_password]): return jsonify({'message': 'All fields are required'}), 400
    if query_db('SELECT id FROM companies WHERE name = ?', [company_name], one=True): return jsonify({'message': 'Company name already exists'}), 400
    if query_db('SELECT id FROM users WHERE username = ?', [admin_username], one=True): return jsonify({'message': 'Admin username already exists'}), 400
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute('INSERT INTO companies (name) VALUES (?)', [company_name])
        new_company_id = cursor.lastrowid
        hashed_password = bcrypt.hashpw(admin_password.encode('utf-8'), bcrypt.gensalt())
        cursor.execute('INSERT INTO users (company_id, username, password_hash, role) VALUES (?, ?, ?, ?)', [new_company_id, admin_username, hashed_password, 'admin'])
        db.commit()
        return jsonify({'message': 'Company and admin user created successfully'}), 201
    except sqlite3.Error:
        get_db().rollback()
        return jsonify({'message': 'Database error occurred'}), 500

@api_bp.route('/master/companies', methods=['GET'])
@roles_required(['master'])
def get_companies():
    try:
        companies = query_db("SELECT id, name FROM companies ORDER BY name")
        return jsonify([dict(row) for row in companies])
    except sqlite3.Error:
        return jsonify({'message': 'Database error occurred'}), 500

@api_bp.route('/master/create_user', methods=['POST'])
@roles_required(['master'])
def master_create_user():
    data = request.get_json()
    username, password, company_id = data.get('username'), data.get('password'), data.get('company_id')
    if not all([username, password, company_id]): return jsonify({'message': 'Username, password, and company_id are required'}), 400
    if query_db('SELECT id FROM users WHERE username = ?', [username], one=True): return jsonify({'message': 'Username already exists'}), 400
    if not query_db('SELECT id FROM companies WHERE id = ?', [company_id], one=True): return jsonify({'message': 'Company not found'}), 404
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    try:
        execute_db('INSERT INTO users (company_id, username, password_hash, role) VALUES (?, ?, ?, ?)', [company_id, username, hashed_password, 'user'])
        return jsonify({'message': 'User created successfully'}), 201
    except sqlite3.Error:
        return jsonify({'message': 'Database error occurred'}), 500

@api_bp.route('/master/create_master', methods=['POST'])
@roles_required(['master'])
def create_master():
    data = request.get_json()
    username, password = data.get('username'), data.get('password')
    if not all([username, password]): return jsonify({'message': 'Username and password are required'}), 400
    if query_db('SELECT id FROM users WHERE username = ?', [username], one=True): return jsonify({'message': 'Username already exists'}), 400
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    try:
        execute_db('INSERT INTO users (company_id, username, password_hash, role) VALUES (?, ?, ?, ?)', [None, username, hashed_password, 'master'])
        return jsonify({'message': 'Master user created successfully'}), 201
    except sqlite3.Error:
        return jsonify({'message': 'Database error occurred'}), 500

@api_bp.route('/master/reset_password', methods=['POST'])
@roles_required(['master'])
def reset_password():
    data = request.get_json()
    user_id, new_password = data.get('user_id'), data.get('new_password')
    if not all([user_id, new_password]): return jsonify({'message': 'user_id and new_password are required'}), 400
    if not query_db('SELECT id FROM users WHERE id = ?', [user_id], one=True):
        return jsonify({'message': 'User not found'}), 404
    hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
    try:
        execute_db('UPDATE users SET password_hash = ? WHERE id = ?', [hashed_password, user_id])
        return jsonify({'message': 'Password reset successfully'}), 200
    except sqlite3.Error as e:
        return jsonify({'message': 'Database error occurred'}), 500
