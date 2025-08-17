# trg_js/flask_api/api.py

from flask import Blueprint, jsonify, request, g, abort, current_app
import sqlite3
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone 
from .log_manager import log_w
import logging
import random
import json
import os

logger = logging.getLogger(__name__)
api_bp = Blueprint('api', __name__, url_prefix='/api')

from .db import query_db, execute_db

# (auth_required, role_required, /auth/signup, /auth/login の各関数は変更なし)
# ...
# --- 認証/認可ヘルパー関数（デコレータ） ---
def auth_required(f):
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]

        if not token:
            logger.warning("Authentication failed: Token is missing.")
            return jsonify({'message': 'Authentication Token is missing!'}), 401

        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            g.current_user_id = data.get('user_id')
            g.current_username = data.get('username')
            g.current_user_role = data.get('role', 'user')
            
        except jwt.ExpiredSignatureError:
            logger.warning(f"Authentication failed for user_id: {g.get('current_user_id')}. Token has expired.")
            return jsonify({'message': 'Token has expired! Please log in again.'}), 401
        except jwt.InvalidTokenError as e:
            logger.error(f"Authentication failed: Invalid Token. Error: {e}")
            return jsonify({'message': 'Token is invalid! Please log in again.'}), 401
        except Exception as e:
            logger.error(f"Authentication failed: Unexpected error during token decoding. Error: {e}", exc_info=True)
            return jsonify({'message': 'An unexpected error occurred during authentication.'}), 500
        
        return f(*args, **kwargs)
    return decorated_function

def role_required(required_role):
    def decorator(f):
        from functools import wraps
        @wraps(f)
        @auth_required
        def decorated_function(*args, **kwargs):
            if not hasattr(g, 'current_user_role') or g.current_user_role != required_role:
                logger.warning(f"Authorization failed for user: {g.get('current_username')}, role: {g.get('current_user_role')}. Required role: {required_role}")
                return jsonify({'message': 'Permission denied: Insufficient role.'}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator


# --- 認証API ---
@api_bp.route('/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username:
        return jsonify({'message': 'Username is required'}), 400
    elif not password:
        return jsonify({'message': 'Password is required'}), 400
    
    existing_user = query_db('SELECT id FROM users WHERE username = ?', [username], one=True)
    if existing_user:
        logger.warning(f"Signup failed: User '{username}' already exists.")
        return jsonify({'message': f'User {username} already exists'}), 400
    else:
        user_count_row = query_db('SELECT COUNT(id) as count FROM users', one=True)
        user_count = user_count_row['count'] if user_count_row else 0
        role = 'admin' if user_count == 0 else 'user'
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        execute_db('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', [username, hashed_password, role])
        logger.info(f"User '{username}' created successfully with role '{role}'.")
        return jsonify({'message': 'User created'}), 201

@api_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400

    user = query_db('SELECT id, username, password_hash, role FROM users WHERE username = ?', [username], one=True)

    if user and bcrypt.checkpw(password.encode('utf-8'), user['password_hash']):
        payload = { 'user_id': user['id'], 'username': user['username'], 'role': user['role'], 'exp': datetime.now(timezone.utc) + timedelta(hours=1) }
        token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')
        logger.info(f"User '{username}' logged in successfully with role '{user['role']}'.")
        return jsonify({'token': token, 'username': user['username'], 'role': user['role']}), 200
    else:
        logger.warning(f"Login failed: Invalid credentials for username '{username}'.")
        return jsonify({'message': 'Invalid credentials'}), 401

# --- クイズAPI ---
@api_bp.route('/quiz/questions', methods=['GET'])
@auth_required
def get_questions():
    # ★★★ 修正: 'rowid' -> 'id' ★★★
    questions = query_db("SELECT id, Q_no, genre, title, choices, answer, explanation FROM quiz_questions")
    logger.info(f"User '{g.current_username}' retrieved {len(questions)} questions.")
    # フロントエンドでは 'rowid' という名前で参照している箇所があるため、APIレスポンスのキーは 'rowid' のままにする
    # 'id' を 'rowid' にマッピングし直す
    response_data = []
    for q in questions:
        q_dict = dict(q)
        q_dict['rowid'] = q_dict.pop('id')
        response_data.append(q_dict)
    return jsonify(response_data)

@api_bp.route('/quiz/questions/<int:question_id>', methods=['GET'])
@auth_required
def get_question(question_id):
    # ★★★ 修正: 'rowid' -> 'id' ★★★
    question = query_db("SELECT id, Q_no, genre, title, choices, answer, explanation FROM quiz_questions WHERE id = ?", [question_id], one=True)
    if question:
        logger.info(f"User '{g.current_username}' retrieved question_id {question_id}.")
        q_dict = dict(question)
        q_dict['rowid'] = q_dict.pop('id')
        return jsonify(q_dict)
    logger.warning(f"Question not found: ID {question_id} requested by '{g.current_username}'.")
    return jsonify({'message': 'Question not found'}), 404

@api_bp.route('/quiz/questions', methods=['POST'])
@role_required('admin')
def create_question():
    data = request.get_json()
    try:
        execute_db("INSERT INTO quiz_questions (genre, title, choices, answer, explanation) VALUES (?, ?, ?, ?, ?)",
                   [data.get('genre'), data.get('title'), data.get('choices'), data.get('answer'), data.get('explanation')])
        logger.info(f"Admin '{g.current_username}' created a new question.")
        return jsonify({'message': 'Question created'}), 201
    except sqlite3.Error as e:
        logger.error(f"Database error creating question: {e}", exc_info=True)
        return jsonify({'message': f'Database error: {e}'}), 500

@api_bp.route('/quiz/questions/<int:question_id>', methods=['PUT'])
@role_required('admin')
def update_question(question_id):
    data = request.get_json()
    try:
        # ★★★ 修正: 'rowid' -> 'id' ★★★
        execute_db("UPDATE quiz_questions SET genre=?, title=?, choices=?, answer=?, explanation=? WHERE id=?",
                   [data.get('genre'), data.get('title'), data.get('choices'), data.get('answer'), data.get('explanation'), question_id])
        logger.info(f"Admin '{g.current_username}' updated question_id {question_id}.")
        return jsonify({'message': 'Question updated'}), 200
    except sqlite3.Error as e:
        logger.error(f"Database error updating question: {e}", exc_info=True)
        return jsonify({'message': f'Database error: {e}'}), 500

@api_bp.route('/quiz/check_answer', methods=['POST'])
@auth_required
def check_answer():
    # ... (この関数は変更なし) ...
    data = request.get_json()
    selected_choices = data.get('user_choice', [])
    correct_ans = data.get('correct_ans', [])
    start_datetime_str = data.get('start_datetime') 
    username = g.current_username
    try:
        start_datetime = datetime.fromisoformat(start_datetime_str.replace('Z', '+00:00'))
    except (ValueError, TypeError):
        return jsonify({'message': 'Invalid start_datetime format.'}), 400
    end_datetime = datetime.now(timezone.utc)
    is_correct = set(selected_choices) == set(correct_ans)
    answer = "正解" if is_correct else f"不正解。正しい答えは: {', '.join(correct_ans)}"
    log_data = { "date": end_datetime.strftime('%Y-%m-%d'), "name": username, "genre": data.get("genre"), "qmap": data.get("qmap"), "question_id": data.get("question_id"), "start_time": start_datetime.strftime('%H:%M:%S'), "end_time": end_datetime.strftime('%H:%M:%S'), "elapsed_time": (end_datetime - start_datetime).total_seconds(), "user_choice": selected_choices, "correct_answers": correct_ans, "result": answer, "kaisetsu": data.get("kaisetsu") }
    log_w(log_data)
    logger.info(f"User '{username}' completed quiz question {data.get('question_id')}. Result: {answer}")
    return jsonify({ 'answer': answer, 'elapsed_time': (end_datetime - start_datetime).total_seconds(), 'correct_ans': correct_ans, 'user_choice': selected_choices }), 200

@api_bp.route('/quiz/genres', methods=['GET'])
@auth_required
def get_genres():
    # ★★★ 修正: 'rowid' -> 'id' ★★★
    all_questions = query_db("SELECT id, genre FROM quiz_questions")
    genre_to_ids = {}
    for topic in all_questions:
        # ★★★ 修正: topic['rowid'] -> topic['id'] ★★★
        topic_id = topic['id']
        genre_list = [g.strip() for g in topic['genre'].split(":") if g.strip()] if topic['genre'] else []
        for genre_name in genre_list:
            if genre_name:
                if genre_name in genre_to_ids:
                    genre_to_ids[genre_name].append(topic_id)
                else:
                    genre_to_ids[genre_name] = [topic_id]
    logger.info(f"User '{g.current_username}' retrieved genres: {list(genre_to_ids.keys())}.")
    return jsonify(genre_to_ids)

@api_bp.route('/quiz/get_random_questions', methods=['GET'])
@auth_required
def get_random_questions():
    genre_param = request.args.get('genre')
    count_param = request.args.get('count', type=int)
    if not genre_param or not count_param:
        return jsonify({'message': 'Genre and count parameters are required'}), 400
    # ★★★ 修正: 'rowid' -> 'id' ★★★
    all_questions_in_db = query_db("SELECT id, Q_no, genre, title, choices, answer, explanation FROM quiz_questions WHERE genre LIKE ?", [f"%{genre_param}%"])
    if not all_questions_in_db:
        return jsonify({'message': 'No questions found for this genre.'}), 404
    random.shuffle(all_questions_in_db)
    selected_questions = all_questions_in_db[:min(count_param, len(all_questions_in_db))]
    
    response_data = []
    for q in selected_questions:
        q_dict = dict(q)
        q_dict['rowid'] = q_dict.pop('id')
        response_data.append(q_dict)
    
    logger.info(f"User '{g.current_username}' requested {count_param} random questions for genre '{genre_param}'.")
    return jsonify(response_data)

# --- ユーザー専用API ---
@api_bp.route('/user/my_results', methods=['GET'])
@auth_required
def get_my_results():
    # ... (この関数は変更なし) ...
    filename = current_app.config.get('LOG_FILE_PATH')
    if not filename or not os.path.exists(filename): return jsonify({})
    my_results = {}
    current_user = g.current_username
    try:
        with open(filename, "r", encoding="utf-8") as file:
            for line in file:
                try:
                    record = json.loads(line.strip())
                    if record.get("name") == current_user:
                        genres = [g.strip() for g in record.get("genre", "").split(":") if g.strip()] or ["不明"]
                        result, q_id = record.get("result"), record.get("question_id")
                        for genre in genres:
                            if genre not in my_results: my_results[genre] = {"correct": 0, "total": 0, "error": []}
                            my_results[genre]["total"] += 1
                            if result == "正解": my_results[genre]["correct"] += 1
                            elif q_id is not None and q_id not in my_results[genre]["error"]: my_results[genre]["error"].append(q_id)
                except (json.JSONDecodeError, KeyError): continue
    except Exception as e:
        logger.error(f"Error processing my_results for user '{current_user}': {e}", exc_info=True)
        return jsonify({'message': 'An error occurred processing results.'}), 500
    logger.info(f"User '{current_user}' retrieved their own results.")
    return jsonify(my_results)

# --- 管理API ---
@api_bp.route('/admin/users', methods=['GET'])
@role_required('admin')
def get_users():
    try:
        users = query_db("SELECT id, username, role, created_at FROM users ORDER BY id")
        logger.info(f"Admin '{g.current_username}' retrieved the user list.")
        return jsonify([dict(row) for row in users])
    except sqlite3.Error as e:
        logger.error(f"Database error getting user list: {e}", exc_info=True)
        return jsonify({'message': f'Database error: {e}'}), 500

@api_bp.route('/admin/results', methods=['GET'])
@role_required('admin')
def get_results():
    # ... (この関数は変更なし) ...
    filename = current_app.config.get('LOG_FILE_PATH')
    if not filename or not os.path.exists(filename): return jsonify({})
    result_data = {}
    try:
        with open(filename, "r", encoding="utf-8") as file:
            for line in file:
                try:
                    record = json.loads(line.strip())
                    name = record.get("name")
                    if not name: continue
                    genres = [g.strip() for g in record.get("genre", "").split(":") if g.strip()] or ["不明"]
                    result, q_id = record.get("result"), record.get("question_id")
                    if name not in result_data: result_data[name] = {}
                    for genre in genres:
                        if genre not in result_data[name]: result_data[name][genre] = {"correct": 0, "total": 0, "error": []}
                        result_data[name][genre]["total"] += 1
                        if result == "正解": result_data[name][genre]["correct"] += 1
                        elif q_id is not None and q_id not in result_data[name][genre]["error"]: result_data[name][genre]["error"].append(q_id)
                except json.JSONDecodeError: continue
    except Exception as e:
        logger.error(f"Error processing log file: {e}", exc_info=True)
        return jsonify({'message': 'An error occurred processing log data.'}), 500
    logger.info(f"Admin '{g.current_username}' retrieved quiz results.")
    return jsonify(result_data)

@api_bp.route('/admin/retry/<int:question_id>', methods=['GET'])
@role_required('admin')
def retry_question(question_id):
    # ★★★ 修正: 'rowid' -> 'id' ★★★
    quiz_item = query_db("SELECT id, Q_no, genre, title, choices, answer, explanation FROM quiz_questions WHERE id = ?", [question_id], one=True)
    if quiz_item is None:
        abort(404, description="問題が見つかりませんでした。")
    
    choices = [c.strip() for c in quiz_item['choices'].split(":") if c.strip()]
    selected_choices = random.sample(choices, min(len(choices), 4)) if choices else []
    correct_ans = [c.strip() for c in quiz_item['answer'].split(":") if c.strip()] if quiz_item['answer'] else []
    
    logger.info(f"Admin '{g.current_username}' preparing retry for question_id {question_id}.")
    return jsonify({
        # ★★★ 修正: 'rowid' -> 'id' ★★★
        "question_id": quiz_item['id'],
        "Q_no": quiz_item['Q_no'],
        "question": quiz_item['title'],
        "choices": selected_choices,
        "correct_ans": correct_ans,
        "genre_name": request.args.get('genre', quiz_item['genre']),
        "kaisetsu": quiz_item['explanation'],
        "start_datetime": datetime.now(timezone.utc).isoformat()
    })