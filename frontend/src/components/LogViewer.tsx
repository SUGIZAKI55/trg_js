import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// ★ 1. log.ndjson の正しい型を定義
interface QuizLogEntry {
  date: string;
  name: string; // これが「学習者」
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
  // 'allLogs' に全データを保持し、'filteredLogs' に表示用データを入れる
  const [allLogs, setAllLogs] = useState<QuizLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<QuizLogEntry[]>([]);
  
  // 絞り込み用の状態
  const [learners, setLearners] = useState<string[]>([]); // ログに登場する全学習者のリスト
  const [selectedLearner, setSelectedLearner] = useState<string>('all'); // 選択中の学習者

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { auth } = useAuth();
  const navigate = useNavigate();

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/admin/logs', {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });

      // ★ 2. APIからのデータ型が QuizLogEntry であることを明示
      const logs: QuizLogEntry[] = response.data;
      setAllLogs(logs); // 全ログを保存
      setFilteredLogs(logs); // 初期状態ではすべて表示

      // ★ 3. ログデータから「学習者」の一覧を作成する
      const learnerSet = new Set(logs.map(log => log.name));
      setLearners(['all', ...Array.from(learnerSet)]); // 'all' (全員) を選択肢の先頭に追加

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

  // ★ 4. 学習者ドロップダウンが変更された時の処理
  const handleLearnerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const learnerName = e.target.value;
    setSelectedLearner(learnerName);

    if (learnerName === 'all') {
      setFilteredLogs(allLogs); // 全員表示
    } else {
      // 選択された学習者のログだけをフィルタリング
      setFilteredLogs(allLogs.filter(log => log.name === learnerName));
    }
  };

  // (loading/errorの表示は変更なし)
  if (loading) return <div><h2>読み込み中...</h2></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        {/* ★ 5. タイトルを「解答ログ」に変更 */}
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

      {/* ★ 6. 学習者の絞り込みドロップダウンを追加 */}
      <div className="form-group mb-3" style={{ maxWidth: '300px' }}>
        <label htmlFor="learner-select" className="form-label">学習者で絞り込む:</label>
        <select 
          id="learner-select" 
          className="form-select"
          value={selectedLearner}
          onChange={handleLearnerChange}
        >
          {learners.map(name => (
            <option key={name} value={name}>
              {name === 'all' ? 'すべての学習者' : name}
            </option>
          ))}
        </select>
      </div>

      {/* ★ 7. テーブルの列をクイズログ用に変更 */}
      <div className="table-responsive">
        <table className="table table-dark table-striped table-hover table-bordered">
          <thead className="thead-dark">
            <tr>
              <th>日時</th>
              <th>学習者 (Name)</th>
              <th>ジャンル</th>
              <th>結果 (Result)</th>
              <th>問題文 (Title)</th>
              <th>ユーザーの解答</th>
              <th>正解</th>
              <th>経過時間(秒)</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, index) => (
                <tr key={index}>
                  <td>{log.date} {log.end_time}</td>
                  <td>{log.name}</td>
                  <td>{log.genre}</td>
                  <td>
                    <span className={`badge ${log.result === '正解' ? 'badge-success' : 'badge-danger'}`}>
                      {log.result.startsWith('不正解') ? '不正解' : '正解'}
                    </span>
                  </td>
                  <td>{log.question_title?.substring(0, 30)}...</td>
                  <td style={{ fontSize: '0.9rem' }}>{log.user_choice?.join(', ')}</td>
                  <td style={{ fontSize: '0.9rem' }}>{log.correct_answers?.join(', ')}</td>
                  <td>{log.elapsed_time?.toFixed(2) || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center">
                  ログエントリがありません。
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