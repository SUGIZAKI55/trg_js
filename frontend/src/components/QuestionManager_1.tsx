import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// 問題データの型を定義
interface Question {
  id: number;
  genre: string;
  title: string;
  answer: string;
}

const QuestionManager: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { auth } = useAuth();
  const navigate = useNavigate();

  // --- 1. 問題リストを取得する関数 ---
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/questions', {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      setQuestions(response.data);
    } catch (err) {
      setError('問題の読み込みに失敗しました。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. コンポーネント読み込み時に問題リストを取得 ---
  useEffect(() => {
    if (auth?.token) {
      fetchQuestions();
    }
  }, [auth?.token]);

  // --- 3. 削除ボタンの処理 ---
  const handleDelete = async (id: number) => {
    if (window.confirm('本当にこの問題を削除しますか？')) {
      try {
        await axios.delete(`/api/questions/${id}`, {
          headers: { Authorization: `Bearer ${auth?.token}` },
        });
        // 削除に成功したら、リストからその問題をフィルタリングしてUIを更新
        setQuestions(questions.filter((q) => q.id !== id));
      } catch (err) {
        alert('削除に失敗しました。');
        console.error(err);
      }
    }
  };

  // --- 4. 編集ボタンの処理 ---
  const handleEdit = (id: number) => {
    // 編集画面（作成画面と共用を想定）に、対象のIDを渡して遷移
    navigate('/create_question', { state: { questionId: id } });
  };

  // --- 5. 新規作成ボタンの処理 ---
  const handleCreate = () => {
    navigate('/create_question');
  };

  // --- UIの表示 ---

  // ロード中の表示
  if (loading) {
    return <div className="container mt-5 text-center"><h2>読み込み中...</h2></div>;
  }

  // エラー発生時の表示
  if (error) {
    return <div className="container mt-5 alert alert-danger">{error}</div>;
  }

  // メインの表示
  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>問題管理</h1>
        <div>
          <button className="btn btn-primary" onClick={handleCreate}>
            ＋ 新規問題を作成
          </button>
          <button className="btn btn-secondary ml-2" onClick={() => navigate('/admin')}>
            管理画面に戻る
          </button>
        </div>
      </div>

      <p>問題の作成、編集、削除を行うエリアです。</p>

      {/* 問題一覧テーブル */}
      <table className="table table-striped table-hover">
        <thead className="thead-dark">
          <tr>
            <th>ID</th>
            <th>ジャンル</th>
            <th>問題文 (冒頭)</th>
            <th>正解</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {questions.length > 0 ? (
            questions.map((q) => (
              <tr key={q.id}>
                <td>{q.id}</td>
                <td>{q.genre}</td>
                <td>{q.title.substring(0, 50)}...</td>
                <td>{q.answer}</td>
                <td>
                  <button
                    className="btn btn-sm btn-info mr-2"
                    onClick={() => handleEdit(q.id)}
                  >
                    編集
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(q.id)}
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center">
                問題はまだありません。
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default QuestionManager;