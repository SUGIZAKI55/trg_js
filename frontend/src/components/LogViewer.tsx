import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';

// ログデータの型
interface QuizLogEntry {
  date: string;
  name: string;
  genre: string;
  question_id: number;
  question_title: string;
  user_choice: string[];
  correct_answers: string[];
  result: string;
  kaisetsu: string;
  start_time: string | null;
  end_time: string;
  elapsed_time: number | null;
}

const LogViewer: React.FC = () => {
  const [allLogs, setAllLogs] = useState<QuizLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<QuizLogEntry[]>([]);
  const [learners, setLearners] = useState<string[]>([]);
  const [selectedLearner, setSelectedLearner] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { auth } = useAuth();
  const navigate = useNavigate();

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get('/admin/logs');

      const logs: QuizLogEntry[] = response.data;
      setAllLogs(logs);
      setFilteredLogs(logs);

      const learnerSet = new Set(logs.map(log => log.name));
      const validNames = Array.from(learnerSet).filter(n => n) as string[];
      setLearners(['all', ...validNames]);

    } catch (err) {
      setError('ログの読み込みに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) {
      fetchLogs();
    }
  }, [auth?.token]);

  const handleLearnerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const learnerName = e.target.value;
    setSelectedLearner(learnerName);
    if (learnerName === 'all') {
      setFilteredLogs(allLogs);
    } else {
      setFilteredLogs(allLogs.filter(log => log.name === learnerName));
    }
  };

  if (loading) return <div className="container mt-5 text-center">読み込み中...</div>;
  if (error) return <div className="container mt-5 alert alert-danger">{error}</div>;

  // ★★★ スタイルの定義 ★★★
  // ここで列ごとの幅を調整します
  const thStyle = { whiteSpace: 'nowrap' as const, minWidth: '100px' }; // 基本の幅
  const wideThStyle = { minWidth: '250px' }; // 問題文など広く取りたい列

  return (
    <div className="container-fluid mt-4" style={{ maxWidth: '1400px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 mb-0">クイズ解答ログ</h1>
        <div>
          <button className="btn btn-primary" onClick={fetchLogs} disabled={loading}>
            {loading ? '更新中...' : 'ログを更新'}
          </button>
          <button className="btn btn-outline-secondary ml-2" onClick={() => navigate('/admin')}>
            管理画面に戻る
          </button>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body d-flex align-items-center py-3">
          <label htmlFor="learner-select" className="form-label mb-0 me-3" style={{ whiteSpace: 'nowrap' }}>
            学習者で絞り込む:
          </label>
          <select 
            id="learner-select" 
            className="form-select"
            value={selectedLearner}
            onChange={handleLearnerChange}
            style={{ maxWidth: '300px' }}
          >
            {learners.map(name => (
              <option key={name} value={name}>
                {name === 'all' ? 'すべての学習者' : name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-responsive shadow-sm" style={{ borderRadius: '8px' }}>
        <table className="table table-hover table-bordered mb-0" style={{ fontSize: '0.95rem' }}>
          <thead style={{ backgroundColor: '#f1f5f9' }}>
            <tr>
              <th style={thStyle}>日時</th>
              <th style={thStyle}>学習者</th>
              <th style={thStyle}>ジャンル</th>
              <th style={{ ...thStyle, minWidth: '80px' }}>結果</th>
              {/* ★★★ 問題文の幅を広げる ★★★ */}
              <th style={wideThStyle}>問題文 (Title)</th>
              {/* ★★★ 解答欄の幅を広げる ★★★ */}
              <th style={wideThStyle}>ユーザーの解答</th>
              <th style={wideThStyle}>正解</th>
              <th style={thStyle}>秒数</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, index) => (
                <tr key={index}>
                  {/* 日時 */}
                  <td style={{ verticalAlign: 'middle' }}>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{log.date}</div>
                    <div style={{ fontWeight: 'bold' }}>{log.end_time}</div>
                  </td>
                  
                  {/* 学習者 */}
                  <td style={{ verticalAlign: 'middle', fontWeight: 'bold' }}>{log.name}</td>
                  
                  {/* ジャンル */}
                  <td style={{ verticalAlign: 'middle' }}>
                    <span className="badge bg-light text-dark border">{log.genre}</span>
                  </td>
                  
                  {/* 結果 */}
                  <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                    {log.result.startsWith('不正解') ? (
                      <span className="badge bg-danger text-white px-3 py-2">不正解</span>
                    ) : (
                      <span className="badge bg-success text-white px-3 py-2">正解</span>
                    )}
                  </td>

                  {/* 問題文 (行間を空けて読みやすく) */}
                  <td style={{ verticalAlign: 'middle', lineHeight: '1.6' }}>
                    {log.question_title}
                  </td>

                  {/* ユーザー解答 */}
                  <td style={{ verticalAlign: 'middle', color: log.result.startsWith('不正解') ? '#dc3545' : 'inherit' }}>
                    {log.user_choice?.map((choice, i) => (
                      <div key={i} style={{ padding: '4px 0', borderBottom: '1px dashed #eee' }}>
                        {choice}
                      </div>
                    ))}
                  </td>

                  {/* 正解 */}
                  <td style={{ verticalAlign: 'middle', color: '#28a745', fontWeight: 'bold' }}>
                    {log.correct_answers?.map((ans, i) => (
                      <div key={i} style={{ padding: '4px 0', borderBottom: '1px dashed #eee' }}>
                        {ans}
                      </div>
                    ))}
                  </td>

                  {/* 秒数 */}
                  <td style={{ verticalAlign: 'middle', textAlign: 'right' }}>
                    {log.elapsed_time ? `${log.elapsed_time.toFixed(1)}秒` : '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-5 text-muted">
                  ログデータがありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogViewer;