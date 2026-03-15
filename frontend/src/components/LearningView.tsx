import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { learningLogsApi } from '../services/api';

interface LearningLog {
  id: number;
  score: number;
  createdAt: string;
  user: {
    username: string;
    company: { name: string };
  };
  course: { title: string };
}

const LearningView: React.FC = () => {
  const { auth } = useAuth();
  const [logs, setLogs] = useState<LearningLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await learningLogsApi.getAll();
        setLogs(res.data);
      } catch (err) {
        console.error('成績データの取得に失敗しました:', err);
      } finally {
        setLoading(false);
      }
    };
    if (auth?.token) fetchLogs();
  }, [auth]);

  if (loading) return <div className="text-light mt-4">読み込み中...</div>;

  return (
    <div className="container mt-4 text-light">
      <h2 className="mb-4">成績管理一覧</h2>
      <div className="card bg-dark border-secondary shadow">
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0">
            <thead>
              <tr className="border-secondary">
                <th>受講日</th>
                <th>ユーザー</th>
                <th>企業</th>
                <th>コース</th>
                <th>スコア</th>
                <th>判定</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map(log => (
                  <tr key={log.id} className="align-middle">
                    <td>{new Date(log.createdAt).toLocaleDateString()}</td>
                    <td className="fw-bold">{log.user?.username || '不明'}</td>
                    <td>{log.user?.company?.name || '未設定'}</td>
                    <td>{log.course?.title || '削除されたコース'}</td>
                    <td className="fw-bold" style={{ fontSize: '1.1rem' }}>
                      {log.score}点
                    </td>
                    <td>
                      <span 
                        className={`badge ${log.score >= 80 ? 'bg-success' : 'bg-danger'}`}
                        style={{ minWidth: '60px', padding: '6px 10px' }}
                      >
                        {log.score >= 80 ? '合格' : '不合格'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-secondary">
                    表示できる成績データがありません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LearningView;