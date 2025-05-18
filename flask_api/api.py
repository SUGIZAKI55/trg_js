# flask_api/api.py
from flask import Blueprint, jsonify, request, g, session, abort, current_app
import sqlite3
import bcrypt
import jwt  # JWTを使う場合
from datetime import datetime, timedelta
from .log_manager import log_w
from quiz import quiz_questions  # quiz.py からインポート
import logging
import random
import json

logger = logging.getLogger(__name__)
api_bp = Blueprint('api', __name__, url_prefix='/api')

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(current_app.config['DATABASE'])
        g.db.row_factory = sqlite3.Row
    return g.db

def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()

def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

def execute_db(query, args=()):
    db = get_db()
    cur = db.cursor()
    cur.execute(query, args)
    db.commit()
    cur.close()

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
    elif query_db('SELECT id FROM users WHERE username = ?', [username], one=True):
        return jsonify({'message': f'User {username} already exists'}), 400
    else:
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        execute_db('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hashed_password])
        return jsonify({'message': 'User created'}), 201

@api_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = query_db('SELECT id, password_hash FROM users WHERE username = ?', [username], one=True)

    if user and bcrypt.checkpw(password.encode('utf-8'), user['password_hash']):
        # JWT を生成 (例)
        payload = {
            'user_id': user['id'],
            'exp': datetime.utcnow() + timedelta(hours=1)
        }
        token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')
        return jsonify({'token': token, 'username': username}), 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

# クイズAPI
@api_bp.route('/quiz/questions', methods=['GET'])
def get_questions():
    questions = query_db("SELECT rowid, Q_no, genre, title, choices, answer, explanation FROM quiz_questions")
    return jsonify([dict(row) for row in questions])

@api_bp.route('/quiz/questions/<int:question_id>', methods=['GET'])
def get_question(question_id):
    question = query_db("SELECT Q_no, genre, title, choices, answer, explanation FROM quiz_questions WHERE rowid = ?", [question_id], one=True)
    if question:
        return jsonify(dict(question))
    return jsonify({'message': 'Question not found'}), 404

@api_bp.route('/quiz/questions', methods=['POST'])
def create_question():
    data = request.get_json()
    genre = data.get('genre')
    title = data.get('title')
    choices = data.get('choices')
    answer = data.get('answer')
    explanation = data.get('explanation')

    if not title:
        return jsonify({'message': 'Title is required'}), 400
    else:
        execute_db("INSERT INTO quiz_questions (genre, title, choices, answer, explanation) VALUES (?, ?, ?, ?, ?)",
                   [genre, title, choices, answer, explanation])
        return jsonify({'message': 'Question created'}), 201

@api_bp.route('/quiz/questions/<int:question_id>', methods=['PUT'])
def update_question(question_id):
    data = request.get_json()
    genre = data.get('genre')
    title = data.get('title')
    choices = data.get('choices')
    answer = data.get('answer')
    explanation = data.get('explanation')

    if not title:
        return jsonify({'message': 'Title is required'}), 400
    else:
        execute_db("UPDATE quiz_questions SET genre=?, title=?, choices=?, answer=?, explanation=? WHERE rowid=?",
                   [genre, title, choices, answer, explanation, question_id])
        return jsonify({'message': 'Question updated'}), 200

@api_bp.route('/quiz/check_answer', methods=['POST'])
def check_answer():
    data = request.get_json()
    selected_choices = data.get('user_choice')
    correct_ans = data.get('correct_ans')
    start_datetime = datetime.strptime(data.get('start_datetime'), '%Y-%m-%d %H:%M:%S')
    end_datetime = datetime.now()
    elapsed_time = end_datetime - start_datetime
    username = data.get('username', "不明")
    genre = data.get("genre")
    qmap = data.get("qmap")
    question_id = data.get("question_id")
    kaisetsu = data.get("kaisetsu")

    answer = "正解" if set(selected_choices) == set(correct_ans) else f"不正解。正しい答えは: {', '.join(correct_ans)}"

    log_data = {
        "date": datetime.now().strftime('%Y-%m-%d'),
        "name": username,
        "genre": genre,
        "qmap": qmap,
        "question_id": question_id,
        "start_time": start_datetime.strftime('%H:%M:%S'),
        "end_time": end_datetime.strftime('%H:%M:%S'),
        "elapsed_time": str(elapsed_time),
        "user_choice": selected_choices,
        "correct_answers": correct_ans,
        "result": answer,
        "kaisetsu": kaisetsu
    }
    log_w(log_data)

    return jsonify({
        'answer': answer,
        'elapsed_time': str(elapsed_time),
        'correct_ans': correct_ans,
        'user_choice': selected_choices
    }), 200

@api_bp.route('/quiz/genres', methods=['GET'])
def get_genres():
    global quiz_questions  # quiz.pyからインポートした変数を使用
    genre_to_ids = {}
    for topic in quiz_questions:
        topic_id = topic[0]
        genre_list = topic[1].split(":")
        for genre in genre_list:
            if genre in genre_to_ids:
                genre_to_ids[genre].append(topic_id)
            else:
                genre_to_ids[genre] = [topic_id]
    return jsonify(genre_to_ids)

# 管理API
@api_bp.route('/admin/results', methods=['GET'])
def get_results():
    filename = "log.ndjson"
    result_data = {}
    try:
        with open(filename, "r", encoding="utf-8") as file:
            for line in file:
                try:
                    record = json.loads(line.strip())
                    name = record.get("name")
                    if not name:
                        continue
                    genres = [g.strip() for g in record.get("genre", "不明").split(":")]
                    result = record.get("result")
                    question_id = record.get("question_id", "不明")
                    if name not in result_data:
                        result_data[name] = {}
                    for genre in genres:
                        if genre not in result_data[name]:
                            result_data[name][genre] = {"correct": 0, "total": 0, "error": []}
                        result_data[name][genre]["total"] += 1
                        if result and result.strip() == "正解":
                            result_data[name][genre]["correct"] += 1
                        elif result:
                            result_data[name][genre]["error"].append(question_id)
            except json.JSONDecodeError:
                logger.error(f"JSON デコードエラー: 行をスキップしました - {line.strip()}")
            except Exception as e:
                logger.error(f"ログ解析中に予期しないエラーが発生しました: {e}")
    except FileNotFoundError:
        logger.warning(f"ログファイル '{filename}' が見つかりません。")
    except Exception as e:
        logger.error(f"ログファイル処理中に予期しないエラーが発生しました: {e}")

    return jsonify(result_data)

@api_bp.route('/admin/retry/<question_id>', methods=['GET'])
def retry_question(question_id):
    global quiz_questions  # quiz.pyからインポートした変数を使用
    quiz_item = next((q for q in quiz_questions if q[0] == question_id), None)
    if quiz_item is None:
        abort(404, description="問題が見つかりませんでした。")
    answer_choices = quiz_item[3].split(":")
    max_choices = min(len(answer_choices), 4)
    selected_choices = random.sample(answer_choices, max_choices)
    correct_answers_temp = set(quiz_item[4].split(":"))
    correct_ans = list(set(selected_choices) & correct_answers_temp)
    genre = request.args.get('genre', 'Unknown')
    start_datetime = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    return jsonify({
        "question_id": question_id,
        "question": quiz_item[2],
        "choices": selected_choices,
        "correct_ans": correct_ans,
        "genre_name": genre,
        "kaisetsu": quiz_item[5],
        "start_datetime": start_datetime
    })