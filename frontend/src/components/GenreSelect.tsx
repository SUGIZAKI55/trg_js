import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const GenreSelect: React.FC = () => {
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await axios.get('/api/quiz/genres', { headers: { Authorization: `Bearer ${auth?.token}` } });
        setGenres(res.data);
        if (res.data.length > 0) setSelectedGenre(res.data[0]);
      } catch {}
    };
    if (auth?.token) fetchGenres();
  }, [auth?.token]);

  const handleStart = async () => {
    try {
      const res = await axios.get('/api/quiz/start', {
        params: { genre: selectedGenre, count: questionCount },
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      navigate('/question', { state: { questions: res.data, session_id: Date.now().toString() } });
    } catch { alert("エラー"); }
  };

  return (
    <div className="container-narrow">
      <div className="text-center mb-5">
        <h1 className="page-title">クイズ設定</h1>
        <p className="page-subtitle">ジャンルと問題数を選択してください</p>
      </div>
      <div className="card">
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">ジャンル</label>
            <select className="form-select" value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">問題数</label>
            <select className="form-select" value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))}>
              {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n}問</option>)}
            </select>
          </div>
          <div className="d-flex-center" style={{ gap: '10px', marginTop: '30px' }}>
            <button className="btn btn-secondary w-100" onClick={() => navigate('/dashboard')}>戻る</button>
            <button className="btn btn-primary w-100" onClick={handleStart}>開始</button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default GenreSelect;