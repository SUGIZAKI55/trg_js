import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { questionsApi } from '../services/api';

interface Question {
  id: number;
  type: string;
  genre: string;
  title: string;
  choices: string;
  answer: string;
  companyId?: number;
}

const QuestionManager: React.FC = () => {
  const { auth } = useAuth();
  const [activeTab, setActiveTab] = useState<'my' | 'library'>('my');
  const [myQuestions, setMyQuestions] = useState<Question[]>([]);
  const [commonQuestions, setCommonQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  // --- 編集モード用の状態 ---
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Question>>({});

  // CSV用
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (auth?.token) {
      fetchMyQuestions();
      fetchCommonQuestions();
    }
  }, [auth]);

  const fetchMyQuestions = async () => {
    try {
      const res = await questionsApi.getAll();
      setMyQuestions(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchCommonQuestions = async () => {
    try {
      const res = await questionsApi.getCommon();
      setCommonQuestions(res.data);
    } catch (err) { console.error(err); }
  };

  // --- 編集開始 ---
  const startEdit = (q: Question) => {
    setEditingId(q.id);
    setEditForm({ ...q });
  };

  // --- 編集保存 ---
  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      await questionsApi.update(editingId, editForm);
      alert('問題を更新しました ✅');
      setEditingId(null);
      fetchMyQuestions();
    } catch (err) {
      alert('更新に失敗しました。バックエンドのEntity設定を確認してください。');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setFile(e.target.files[0]);
  };

  const handleUploadCsv = async () => {
    if (!file) return alert('ファイルを選択してください');
    const formData = new FormData();
    formData.append('file', file);
    try {
      setLoading(true);
      const res = await questionsApi.upload(formData);
      alert(`${res.data.count}件登録しました`);
      fetchCommonQuestions();
      setFile(null);
    } catch (error) {
      alert('アップロード失敗');
    } finally { setLoading(false); }
  };

  const handleCopy = async (questionId: number) => {
    if (!window.confirm('自社リストに取り込みますか？')) return;
    try {
      await questionsApi.copy(questionId);
      alert('取り込み完了！');
      fetchMyQuestions();
    } catch (error) { alert('コピー失敗'); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('この問題を削除しますか？')) return;
    try {
      await questionsApi.delete(id);
      fetchMyQuestions();
      fetchCommonQuestions();
    } catch (error) { alert('削除失敗'); }
  };

  return (
    <div className="container-main mt-4">
      <h2 className="page-title mb-4">問題管理・編集</h2>

      {/* CSVエリア (Master用) */}
      {auth?.role?.toUpperCase() === 'MASTER' && (
        <div className="card shadow-sm mb-4 border-0" style={{ background: '#2c2c2e', borderLeft: '5px solid #FFD700' }}>
          <div className="card-body">
            <h5 className="text-warning">📂 ライブラリ一括登録 (マスター権限)</h5>
            <div className="d-flex gap-2 align-items-center mt-3">
              <input type="file" className="form-control form-control-sm w-auto bg-dark text-white border-secondary" accept=".csv" onChange={handleFileChange} />
              <button onClick={handleUploadCsv} disabled={loading} className="btn btn-primary btn-sm px-4">
                {loading ? '送信中...' : 'アップロード'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* タブ切り替え */}
      <div className="d-flex gap-2 mb-4">
        <button onClick={() => setActiveTab('my')} className={`btn flex-grow-1 py-2 fw-bold ${activeTab === 'my' ? 'btn-primary' : 'btn-dark border-secondary text-secondary'}`}>
          🏢 自社の問題リスト
        </button>
        <button onClick={() => setActiveTab('library')} className={`btn flex-grow-1 py-2 fw-bold ${activeTab === 'library' ? 'btn-primary' : 'btn-dark border-secondary text-secondary'}`}>
          📚 共通ライブラリから追加
        </button>
      </div>

      {activeTab === 'my' && (
        <div className="card bg-dark text-light border-secondary shadow-lg">
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0">
              <thead>
                <tr className="border-secondary text-muted small uppercase">
                  <th className="py-3" style={{ width: '60px' }}>ID</th>
                  <th className="py-3" style={{ width: '160px' }}>属性</th>
                  <th className="py-3">問題内容 / 回答設定</th>
                  <th className="py-3" style={{ width: '140px' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {myQuestions.map((q) => (
                  <tr key={q.id} className="align-middle border-secondary">
                    <td className="text-secondary">{q.id}</td>
                    <td>
                      {editingId === q.id ? (
                        <>
                          <input className="form-control form-control-sm mb-1 bg-secondary text-white border-0" value={editForm.genre} onChange={e => setEditForm({...editForm, genre: e.target.value})} placeholder="ジャンル" />
                          <select className="form-select form-select-sm bg-secondary text-white border-0" value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value})}>
                            <option value="SINGLE">択一形式</option>
                            <option value="MULTI">複数選択</option>
                          </select>
                        </>
                      ) : (
                        <div>
                          <span className="badge bg-info text-dark mb-1">{q.genre}</span>
                          <div className="small text-muted">{q.type === 'SINGLE' ? '択一' : '複数選択'}</div>
                        </div>
                      )}
                    </td>
                    <td>
                      {editingId === q.id ? (
                        <div className="d-flex flex-column gap-1">
                          <input className="form-control bg-secondary text-white border-0" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} placeholder="問題文を入力" />
                          <input className="form-control form-control-sm bg-secondary text-white border-0" value={editForm.choices} onChange={e => setEditForm({...editForm, choices: e.target.value})} placeholder="選択肢 (例: A:はい|B:いいえ)" />
                          <div className="input-group input-group-sm">
                            <span className="input-group-text bg-primary text-white border-0 small">正解キー</span>
                            <input className="form-control bg-secondary text-white border-0" value={editForm.answer} onChange={e => setEditForm({...editForm, answer: e.target.value.toUpperCase()})} placeholder="A または A,C" />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="fw-bold mb-1">{q.title}</div>
                          <div className="small text-secondary mb-1">{q.choices}</div>
                          <div className="small"><span className="text-info">正解:</span> <span className="badge bg-outline-info border border-info text-info">{q.answer}</span></div>
                        </div>
                      )}
                    </td>
                    <td>
                      {editingId === q.id ? (
                        <div className="d-flex gap-1">
                          <button onClick={handleUpdate} className="btn btn-sm btn-success px-3">保存</button>
                          <button onClick={() => setEditingId(null)} className="btn btn-sm btn-outline-light">取消</button>
                        </div>
                      ) : (
                        <div className="d-flex gap-1">
                          <button onClick={() => startEdit(q)} className="btn btn-sm btn-outline-primary">編集</button>
                          <button onClick={() => handleDelete(q.id)} className="btn btn-sm btn-outline-danger">削除</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'library' && (
        <div className="card bg-dark text-light border-secondary">
          <table className="table table-dark table-hover">
            <thead>
              <tr className="border-secondary text-muted small">
                <th>ジャンル</th><th>問題文</th><th>正解</th><th>操作</th>
              </tr>
            </thead>
            <tbody>
              {commonQuestions.map((q) => (
                <tr key={q.id} className="align-middle border-secondary">
                  <td><span className="badge bg-secondary">{q.genre}</span></td>
                  <td>{q.title}</td>
                  <td><span className="text-info fw-bold">{q.answer}</span></td>
                  <td>
                    <button onClick={() => handleCopy(q.id)} className="btn btn-sm btn-primary px-3">＋ 取り込む</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QuestionManager;