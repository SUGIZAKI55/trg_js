import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Question {
  id: number;
  genre: string;
  title: string;
  answer: string;
}

const QuestionManager: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get('/api/questions', {
          headers: { Authorization: `Bearer ${auth?.token}` },
        });
        setQuestions(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (auth?.token) fetchQuestions();
  }, [auth?.token]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("本当に削除しますか？")) return;
    try {
      await axios.delete(`/api/questions/${id}`, {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      setQuestions(questions.filter((q) => q.id !== id));
    } catch (err) {
      alert("削除に失敗しました");
    }
  };

  return (
    <div className="container-main">
      <div className="text-center mb-5">
        <h1 className="page-title">問題管理</h1>
        <div className="d-flex-center" style={{ gap: '10px', marginTop: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin')}>戻る</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/create_question')}>新規作成</button>
        </div>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>ジャンル</th>
                  <th>問題文</th>
                  <th>正解</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q.id}>
                    <td>{q.id}</td>
                    <td><span className="role-badge admin">{q.genre}</span></td>
                    <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {q.title}
                    </td>
                    <td>{q.answer}</td>
                    <td>
                      <div className="d-flex-center" style={{ gap: '8px', justifyContent: 'flex-start' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/create_question', { state: { questionId: q.id } })}>編集</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(q.id)}>削除</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionManager;