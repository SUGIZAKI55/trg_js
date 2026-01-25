import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const GenreSelect: React.FC = () => {
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [questionCount, setQuestionCount] = useState(5); // 初期値を5問に変更
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        // エンドポイントを /api/questions/genres に修正
        const res = await axios.get('http://localhost:3000/api/questions/genres', { 
          headers: { Authorization: `Bearer ${auth?.token}` } 
        });
        setGenres(res.data);
        if (res.data.length > 0) setSelectedGenre(res.data[0]);
      } catch (err) {
        console.error("ジャンル取得エラー:", err);
      }
    };
    if (auth?.token) fetchGenres();
  }, [auth]);

  const handleStart = async () => {
    if (!selectedGenre) return alert("ジャンルを選択してください");
    try {
      // 受講用の問題をAPIから取得
      const res = await axios.get('http://localhost:3000/api/questions/quiz-start', {
        params: { genre: selectedGenre, count: questionCount },
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      
      if (res.data.length === 0) {
        alert("該当するジャンルの問題がありません");
        return;
      }

      navigate('/question', { 
        state: { 
          questions: res.data, 
          session_id: Date.now().toString() 
        } 
      });
    } catch (err) {
      alert("クイズの開始に失敗しました");
    }
  };

  return (
    <div className="container mt-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-light">クイズ設定</h1>
        <p className="text-secondary">受講するジャンルと問題数を選んでください</p>
      </div>

      <div className="card bg-dark border-secondary shadow-lg mx-auto" style={{ maxWidth: '500px' }}>
        <div className="card-body p-4">
          <div className="mb-4">
            <label className="form-label text-info fw-bold">ジャンルを選択</label>
            <select 
              className="form-select bg-dark text-white border-secondary py-2" 
              value={selectedGenre} 
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              {genres.length > 0 ? (
                genres.map(g => <option key={g} value={g}>{g}</option>)
              ) : (
                <option value="">問題が登録されていません</option>
              )}
            </select>
          </div>

          <div className="mb-4">
            <label className="form-label text-info fw-bold">問題数</label>
            <select 
              className="form-select bg-dark text-white border-secondary py-2" 
              value={questionCount} 
              onChange={(e) => setQuestionCount(Number(e.target.value))}
            >
              {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n}問</option>)}
            </select>
          </div>

          <div className="d-flex gap-2 mt-5">
            <button className="btn btn-outline-secondary flex-grow-1" onClick={() => navigate('/dashboard')}>戻る</button>
            <button 
              className="btn btn-primary flex-grow-1 fw-bold" 
              onClick={handleStart}
              disabled={genres.length === 0}
            >
              開始する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenreSelect;