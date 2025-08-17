# trg_js/flask_api/api.py

from flask import Blueprint, jsonify, request, g, abort, current_app
import sqlite3
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone # ★★★ timezone をインポート ★★★
# log_manager.py から log_w 関数のみをインポート
from .log_manager import log_w
import logging
import random
import json
import os # osモジュールをインポート

logger = logging.getLogger(__name__)
api_bp = Blueprint('api', __name__, url_prefix='/api')

# db.py から query_db, execute_db を直接インポートします
from .db import query_db, execute_db

# --- 認証/認可ヘルパー関数（デコレータ） ---
def auth_required(f):
    """JWTトークン認証を要求するデコレータ"""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        # Authorizationヘッダーからトークンを取得
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]

        if not token:
            logger.warning("Authentication failed: Token is missing.")
            return jsonify({'message': 'Authentication Token is missing!'}), 401

        try:
            # トークンをデコードしてペイロードを取得
            # SECRET_KEYは current_app.config から取得
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            
            # gオブジェクトにユーザー情報を保存（リクエスト中のみ利用可能）
            g.current_user_id = data.get('user_id')
            g.current_username = data.get('username')
            g.current_user_role = data.get('role', 'user') # ロール情報もgに保存、デフォルトは'user'
            
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
    """特定のロールを持つユーザーのみにアクセスを制限するデコレータ"""
    def decorator(f):
        from functools import wraps
        @wraps(f)
        @auth_required # まず認証を通過させる
        def decorated_function(*args, **kwargs):
            if not hasattr(g, 'current_user_role') or g.current_user_role != required_role:
                logger.warning(f"Authorization failed for user: {g.get('current_username')}, role: {g.get('current_user_role')}. Required role: {required_role}")
                return jsonify({'message': 'Permission denied: Insufficient role.'}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator


# 認証API
@api_bp.route('/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username:
        return jsonify({'message': 'Username is required'}), 400
    elif not password:
        return jsonify({'message': 'Password is required'}), 400
    
    # ユーザー名が既に存在するかチェック
    existing_user = query_db('SELECT id FROM users WHERE username = ?', [username], one=True)
    if existing_user:
        logger.warning(f"Signup failed: User '{username}' already exists.")
        return jsonify({'message': f'User {username} already exists'}), 400
    else:
        # パスワードをハッシュ化
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        # ★修正: role カラムにデフォルト値 'user' を挿入
        execute_db('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', [username, hashed_password, 'user'])
        logger.info(f"User '{username}' created successfully with role 'user'.")
        return jsonify({'message': 'User created'}), 201

@api_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400

    # ★★★修正箇所: SELECT 文に 'username' カラムを追加しました★★★
    user = query_db('SELECT id, username, password_hash, role FROM users WHERE username = ?', [username], one=True)

    if user and bcrypt.checkpw(password.encode('utf-8'), user['password_hash']):
        # JWTペイロードにユーザーID、ユーザー名、ロールを含める
        payload = {
            'user_id': user['id'],
            'username': user['username'], # user['username'] が正しくアクセスできるようになる
            'role': user['role'], # ロール情報をJWTペイロードに追加
            'exp': datetime.now(timezone.utc) + timedelta(hours=1) # ★★★ UTC基準に変更 ★★★
        }
        token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')
        logger.info(f"User '{username}' logged in successfully with role '{user['role']}'.")
        # フロントエンドにもロール情報を返す
        return jsonify({'token': token, 'username': user['username'], 'role': user['role']}), 200
    else:
        logger.warning(f"Login failed: Invalid credentials for username '{username}'.")
        return jsonify({'message': 'Invalid credentials'}), 401

# --- クイズAPI ---
@api_bp.route('/quiz/questions', methods=['GET'])
@auth_required # 認証されたユーザーのみ問題一覧にアクセス可能
def get_questions():
    questions = query_db("SELECT rowid, Q_no, genre, title, choices, answer, explanation FROM quiz_questions")
    logger.info(f"User '{g.current_username}' retrieved {len(questions)} questions.")
    return jsonify([dict(row) for row in questions])

@api_bp.route('/quiz/questions/<int:question_id>', methods=['GET'])
@auth_required # 認証されたユーザーのみ個別の問題取得にアクセス可能
def get_question(question_id):
    question = query_db("SELECT rowid, Q_no, genre, title, choices, answer, explanation FROM quiz_questions WHERE rowid = ?", [question_id], one=True)
    if question:
        logger.info(f"User '{g.current_username}' retrieved question_id {question_id}.")
        return jsonify(dict(question))
    logger.warning(f"Question not found: ID {question_id} requested by '{g.current_username}'.")
    return jsonify({'message': 'Question not found'}), 404

@api_bp.route('/quiz/questions', methods=['POST'])
@role_required('admin') # ★追加: 管理者のみ問題作成可能
def create_question():
    data = request.get_json()
    genre = data.get('genre')
    title = data.get('title')
    choices = data.get('choices')
    answer = data.get('answer')
    explanation = data.get('explanation')

    # 必須フィールドのバリデーションを強化
    if not all([genre, title, choices, answer]):
        logger.warning(f"Create question failed: Missing required fields for user '{g.current_username}'. Data: {data}")
        return jsonify({'message': 'Genre, Title, Choices, and Answer are required'}), 400
    
    # Q_no は自動採番されることが多いため、ここではデータベース任せにしています。
    # 必要であれば、採番ロジックを追加してください。
    try:
        execute_db("INSERT INTO quiz_questions (genre, title, choices, answer, explanation) VALUES (?, ?, ?, ?, ?)",
                   [genre, title, choices, answer, explanation])
        logger.info(f"Admin '{g.current_username}' created a new question: '{title}' in genre '{genre}'.")
        return jsonify({'message': 'Question created'}), 201
    except sqlite3.Error as e:
        logger.error(f"Database error creating question for admin '{g.current_username}': {e}", exc_info=True)
        return jsonify({'message': f'Database error: {e}'}), 500


@api_bp.route('/quiz/questions/<int:question_id>', methods=['PUT'])
@role_required('admin') # ★追加: 管理者のみ問題更新可能
def update_question(question_id):
    data = request.get_json()
    genre = data.get('genre')
    title = data.get('title')
    choices = data.get('choices')
    answer = data.get('answer')
    explanation = data.get('explanation')

    # 必須フィールドのバリデーションを強化
    if not all([genre, title, choices, answer]):
        logger.warning(f"Update question failed: Missing required fields for question_id {question_id} by '{g.current_username}'. Data: {data}")
        return jsonify({'message': 'Genre, Title, Choices, and Answer are required'}), 400
    
    try:
        execute_db("UPDATE quiz_questions SET genre=?, title=?, choices=?, answer=?, explanation=? WHERE rowid=?",
                   [genre, title, choices, answer, explanation, question_id])
        logger.info(f"Admin '{g.current_username}' updated question_id {question_id}: '{title}'.")
        return jsonify({'message': 'Question updated'}), 200
    except sqlite3.Error as e:
        logger.error(f"Database error updating question_id {question_id} for admin '{g.current_username}': {e}", exc_info=True)
        return jsonify({'message': f'Database error: {e}'}), 500

@api_bp.route('/quiz/check_answer', methods=['POST'])
@auth_required # 解答チェックも認証されたユーザーのみに限定
def check_answer():
    data = request.get_json()
    selected_choices = data.get('user_choice', []) # デフォルト値でNone回避
    correct_ans = data.get('correct_ans', [])     # デフォルト値でNone回避
    start_datetime_str = data.get('start_datetime') 
    username_from_frontend = data.get('username', "不明") # Frontendから渡されるusername
    
    # JWTから取得したユーザー名を優先
    username = g.current_username if hasattr(g, 'current_username') else username_from_frontend

    genre = data.get("genre")
    qmap = data.get("qmap") # 問題番号 (Q_no)
    question_id = data.get("question_id") # DBのrowid
    kaisetsu = data.get("kaisetsu")

    if not start_datetime_str:
        logger.warning(f"Check answer failed: Missing start_datetime for user '{username}'.")
        return jsonify({'message': 'start_datetime is required'}), 400

    try:
        # ★★★ 修正箇所: ISO 8601形式の文字列をtimezone-awareなdatetimeオブジェクトに変換 ★★★
        # 'Z' (Zulu time) を '+00:00' に置換して fromisoformat でパース
        start_datetime = datetime.fromisoformat(start_datetime_str.replace('Z', '+00:00'))
    except (ValueError, TypeError):
        logger.warning(f"Check answer failed: Invalid start_datetime format '{start_datetime_str}' for user '{username}'.")
        return jsonify({'message': 'Invalid start_datetime format. Expected ISO 8601 format (e.g., YYYY-MM-DDTHH:MM:SS.sssZ)'}), 400

    # ★★★ 修正箇所: 現在時刻もUTCで取得してタイムゾーンを統一 ★★★
    end_datetime = datetime.now(timezone.utc)
    elapsed_time = end_datetime - start_datetime

    # set() を使用して、選択肢の順序に関わらず正解を判定
    is_correct = set(selected_choices) == set(correct_ans)
    answer = "正解" if is_correct else f"不正解。正しい答えは: {', '.join(correct_ans)}"

    log_data = {
        "date": datetime.now(timezone.utc).strftime('%Y-%m-%d'), # ★★★ UTC基準に変更 ★★★
        "name": username,
        "genre": genre,
        "qmap": qmap,
        "question_id": question_id,
        "start_time": start_datetime.strftime('%H:%M:%S'),
        "end_time": end_datetime.strftime('%H:%M:%S'),
        "elapsed_time": elapsed_time.total_seconds(), # timedeltaオブジェクトから秒数(float)で保存
        "user_choice": selected_choices,
        "correct_answers": correct_ans,
        "result": answer,
        "kaisetsu": kaisetsu
    }
    log_w(log_data) # log_manager の log_w を呼び出す
    logger.info(f"User '{username}' completed quiz question {question_id}. Result: {answer}")

    return jsonify({
        'answer': answer,
        'elapsed_time': elapsed_time.total_seconds(), # 秒単位で返す
        'correct_ans': correct_ans,
        'user_choice': selected_choices
    }), 200

@api_bp.route('/quiz/genres', methods=['GET'])
@auth_required # 認証されたユーザーのみジャンル一覧にアクセス可能
def get_genres():
    all_questions = query_db("SELECT rowid, Q_no, genre, title, choices, answer, explanation FROM quiz_questions")
    
    genre_to_ids = {}
    for topic in all_questions:
        topic_id = topic['rowid']
        # ジャンルはコロン区切りで複数存在する可能性を考慮し、空文字列を除外
        genre_list = [g.strip() for g in topic['genre'].split(":") if g.strip()] if topic['genre'] else []
        for genre_name in genre_list:
            if genre_name: # 空文字列でないことを再確認
                if genre_name in genre_to_ids:
                    genre_to_ids[genre_name].append(topic_id)
                else:
                    genre_to_ids[genre_name] = [topic_id]
    logger.info(f"User '{g.current_username}' retrieved genres: {list(genre_to_ids.keys())}.")
    return jsonify(genre_to_ids)

# ランダムな問題を取得するエンドポイント
@api_bp.route('/quiz/get_random_questions', methods=['GET'])
@auth_required # 認証されたユーザーのみランダム問題取得にアクセス可能
def get_random_questions():
    genre_param = request.args.get('genre')
    count_param = request.args.get('count', type=int)

    if not genre_param or not count_param:
        logger.warning(f"Get random questions failed: Missing genre or count for user '{g.current_username}'.")
        return jsonify({'message': 'Genre and count parameters are required'}), 400

    # ジャンルをLIKE検索で部分一致させる (例: "Python:Flask" の問題が "Python" でヒットするように)
    # 大文字小文字を区別しない検索にしたい場合、SQLITEでは COLLATE NOCASE を使うか、Python側でlower()を使う。
    all_questions_in_db = query_db("SELECT rowid, Q_no, genre, title, choices, answer, explanation FROM quiz_questions WHERE genre LIKE ?", [f"%{genre_param}%"])

    if not all_questions_in_db:
        logger.info(f"No questions found for genre '{genre_param}' for user '{g.current_username}'.")
        return jsonify({'message': 'No questions found for this genre or the genre does not exist.'}), 404

    random.shuffle(all_questions_in_db)
    # 指定された問題数を超えないように調整
    selected_questions = all_questions_in_db[:min(count_param, len(all_questions_in_db))]

    logger.info(f"User '{g.current_username}' requested {count_param} random questions for genre '{genre_param}'. Selected {len(selected_questions)} questions.")
    return jsonify([dict(row) for row in selected_questions])


# --- 管理API ---
@api_bp.route('/admin/results', methods=['GET'])
@role_required('admin') # ★追加: 管理者のみアクセス可能
def get_results():
    # current_app.config からログファイルのパスを取得
    filename = current_app.config.get('LOG_FILE_PATH')
    if not filename:
        logger.error("ログファイルパスが設定されていません (current_app.config['LOG_FILE_PATH']がNone)。")
        return jsonify({'message': 'Log file path not configured.'}), 500

    result_data = {}
    try:
        if not os.path.exists(filename):
            logger.warning(f"ログファイル '{filename}' が見つかりません。結果データはありません。")
            return jsonify({'message': 'No quiz results available yet, log file not found.'}), 200 # 200 OK で空データを返す

        with open(filename, "r", encoding="utf-8") as file:
            for line in file:
                try:
                    record = json.loads(line.strip())
                    name = record.get("name")
                    if not name:
                        continue
                    # ジャンルはコロン区切りで複数存在する可能性を考慮し、空文字列を除外
                    genres = [g.strip() for g in record.get("genre", "").split(":") if g.strip()]
                    if not genres: # ジャンルが空の場合は「不明」として扱う
                        genres = ["不明"]

                    result = record.get("result")
                    question_id = record.get("question_id") # 数値である可能性も考慮し、デフォルト値は設定しない
                    
                    if name not in result_data:
                        result_data[name] = {}
                    for genre in genres:
                        if genre not in result_data[name]:
                            result_data[name][genre] = {"correct": 0, "total": 0, "error": []}
                        
                        result_data[name][genre]["total"] += 1
                        if result and result.strip() == "正解":
                            result_data[name][genre]["correct"] += 1
                        elif result: # 不正解の場合のみIDを追加
                            if question_id is not None and question_id not in result_data[name][genre]["error"]: # 重複とNoneを防ぐ
                                result_data[name][genre]["error"].append(question_id)
                except json.JSONDecodeError:
                    logger.error(f"JSON デコードエラー: ログ行をスキップしました - '{line.strip()}'")
                except Exception as e:
                    logger.error(f"ログ解析中に予期しないエラーが発生しました: {e}. 行: '{line.strip()}'", exc_info=True)
    except Exception as e:
        logger.error(f"ログファイル処理中に予期しないエラーが発生しました: {e}", exc_info=True)
        return jsonify({'message': 'An error occurred while processing log data.'}), 500

    logger.info(f"Admin '{g.current_username}' retrieved quiz results.")
    return jsonify(result_data)

@api_bp.route('/admin/retry/<int:question_id>', methods=['GET']) # question_id を int に型指定
@role_required('admin') # ★追加: 管理者のみアクセス可能
def retry_question(question_id):
    quiz_item = query_db("SELECT rowid, Q_no, genre, title, choices, answer, explanation FROM quiz_questions WHERE rowid = ?", [question_id], one=True)
    
    if quiz_item is None:
        logger.warning(f"Admin '{g.current_username}' requested retry for non-existent question_id {question_id}.")
        abort(404, description="問題が見つかりませんでした。")
    
    # choicesはテキストなので、':'で分割し、空文字列を除外
    all_choices = quiz_item['choices'].split(":")
    answer_choices = [c.strip() for c in all_choices if c.strip()]
    
    # 選択肢をシャッフルし、表示数を最大4つに制限（元のロジックを保持）
    max_choices_to_display = min(len(answer_choices), 4)
    # 空のanswer_choicesの場合にrandom.sampleがエラーにならないようチェック
    selected_choices_for_display = random.sample(answer_choices, max_choices_to_display) if answer_choices else []

    correct_ans_list = [c.strip() for c in quiz_item['answer'].split(":") if c.strip()] if quiz_item['answer'] else []
    
    # クライアントからジャンルが指定された場合それを使用、なければDBから取得したジャンルを使用
    genre = request.args.get('genre', quiz_item['genre'])
    
    # ★★★ 修正箇所: 開始時刻もUTCで生成してフロントエンドに渡す ★★★
    start_datetime = datetime.now(timezone.utc).isoformat()


    logger.info(f"Admin '{g.current_username}' preparing retry for question_id {question_id}.")
    return jsonify({
        "question_id": quiz_item['rowid'],
        "Q_no": quiz_item['Q_no'],
        "question": quiz_item['title'],
        "choices": selected_choices_for_display, # シャッフルされた選択肢
        "correct_ans": correct_ans_list,
        "genre_name": genre, # Frontendではgenre_nameとして利用
        "kaisetsu": quiz_item['explanation'],
        "start_datetime": start_datetime
    })