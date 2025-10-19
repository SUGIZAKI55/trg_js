import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const GenreSelect: React.FC = () => {
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { auth } = useAuth();
  const navigate = useNavigate();

  // 1. ジャンル一覧をAPIから取得
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await axios.get('/api/quiz/genres', {
          headers: { Authorization: `Bearer ${auth?.token}` },
        });
        setGenres(res.data);
        if (res.data.length > 0) {
          setSelectedGenre(res.data[0]); // 最初のジャンルをデフォルト選択
        }
      } catch (err) {
        setError('ジャンルの読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    };
    fetchGenres();
  }, [auth?.token]);

  // 2. クイズ開始ボタンの処理
  const handleStartQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      // 選択したジャンルと問題数でクイズデータを取得
      const res = await axios.get('/api/quiz/start', {
        params: { genre: selectedGenre, count: questionCount },
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      
      const questions = res.data;
      if (!questions || questions.length === 0) {
        setError('このジャンルの問題が見つかりませんでした。');
        return;
      }
      
      // クイズ画面に「問題データ」と「セッションID」を渡して遷移
      const session_id = `${Date.now()}-${auth?.username}`;
      navigate('/question', { state: { questions, session_id } });

    } catch (err) {
      setError('クイズの開始に失敗しました。');
    }
  };

  if (loading) return <div className="container mt-5">読み込み中...</div>;

  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <h1 className="text-center">クイズ設定</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleStartQuiz}>
        <div className="form-group">
          <label htmlFor="genre-select">ジャンルを選択:</label>
          <select
            id="genre-select"
            className="form-control"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            {genres.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="question-count">問題数:</label>
          <input
            type="number"
            id="question-count"
            className="form-control"
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            min="1"
            max="50"
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block">
          クイズ開始
        </button>
        <button type="button" className="btn btn-secondary btn-block mt-2" onClick={() => navigate('/dashboard')}>
          戻る
        </button>
      </form>
    </div>
  );
};

export default GenreSelect;