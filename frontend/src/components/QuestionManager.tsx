import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import QuestionEditModal from './QuestionEditModal';

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

  // --- 検索・フィルタ・ソート用の状態 ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState<'id' | 'genre' | 'type'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // --- モーダル編集用の状態 ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalQuestion, setModalQuestion] = useState<Question | null>(null);

  // CSV用
  const [file, setFile] = useState<File | null>(null);

  // --- 一括削除用の状態 ---
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (auth?.token) {
      fetchMyQuestions();
      fetchCommonQuestions();
    }
  }, [auth]);

  const fetchMyQuestions = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/questions', {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      setMyQuestions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCommonQuestions = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/questions/common', {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      setCommonQuestions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // --- 検索・フィルタ・ソート処理 ---
  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = myQuestions.filter((q) => {
      const matchesSearch =
        searchTerm === '' ||
        q.id.toString().includes(searchTerm) ||
        q.title.toLowerCase().includes(searchTerm) ||
        q.genre.toLowerCase().includes(searchTerm);

      const matchesGenre = selectedGenre === 'all' || q.genre === selectedGenre;
      const matchesType = selectedType === 'all' || q.type === selectedType;

      return matchesSearch && matchesGenre && matchesType;
    });

    // ソート処理
    filtered.sort((a, b) => {
      let compareValue = 0;
      if (sortBy === 'id') {
        compareValue = a.id - b.id;
      } else if (sortBy === 'genre') {
        compareValue = a.genre.localeCompare(b.genre);
      } else if (sortBy === 'type') {
        compareValue = a.type.localeCompare(b.type);
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [myQuestions, searchTerm, selectedGenre, selectedType, sortBy, sortOrder]);

  // --- ページネーション処理 ---
  const totalPages = Math.ceil(filteredAndSortedQuestions.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedQuestions = filteredAndSortedQuestions.slice(startIdx, endIdx);

  // --- ユニークなジャンル一覧を取得 ---
  const uniqueGenres = useMemo(() => {
    const genres = [...new Set(myQuestions.map((q) => q.genre))];
    return genres.sort();
  }, [myQuestions]);

  // --- モーダルを開く ---
  const openEditModal = (question: Question) => {
    setModalQuestion(question);
    setIsModalOpen(true);
  };

  // --- モーダルを閉じる ---
  const closeModal = () => {
    setIsModalOpen(false);
    setModalQuestion(null);
  };

  // --- 更新完了時の処理 ---
  const handleUpdateSuccess = () => {
    closeModal();
    fetchMyQuestions();
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
      const res = await axios.post('http://localhost:3000/api/questions/upload', formData, {
        headers: { Authorization: `Bearer ${auth?.token}`, 'Content-Type': 'multipart/form-data' },
      });
      alert(`${res.data.count}件登録しました`);
      fetchCommonQuestions();
      fetchMyQuestions();
      setFile(null);
    } catch (error) {
      alert('アップロード失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (questionId: number) => {
    if (!window.confirm('自社リストに取り込みますか？')) return;
    try {
      await axios.post(`http://localhost:3000/api/questions/${questionId}/copy`, {}, {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      alert('取り込み完了！');
      fetchMyQuestions();
    } catch (error) {
      alert('コピー失敗');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('この問題を削除しますか？')) return;
    try {
      await axios.delete(`http://localhost:3000/api/questions/${id}`, {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      fetchMyQuestions();
      fetchCommonQuestions();
    } catch (error) {
      alert('削除失敗');
    }
  };

  const toggleSort = (field: 'id' | 'genre' | 'type') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return '⇅';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  // --- 一括削除用ハンドラ ---
  const toggleSelect = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedQuestions.length && paginatedQuestions.length > 0) {
      setSelectedIds(new Set());
    } else {
      const allIds = new Set(paginatedQuestions.map((q) => q.id));
      setSelectedIds(allIds);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) {
      alert('削除対象を選択してください');
      return;
    }

    if (!window.confirm(`${selectedIds.size}件の問題を削除しますか？`)) return;

    try {
      await axios.post(
        'http://localhost:3000/api/questions/batch-delete',
        { questionIds: Array.from(selectedIds) },
        {
          headers: { Authorization: `Bearer ${auth?.token}` },
        }
      );
      alert('削除完了！');
      setSelectedIds(new Set());
      fetchMyQuestions();
    } catch (error) {
      alert('一括削除失敗');
      console.error(error);
    }
  };

  const handleExportCsv = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedGenre !== 'all') params.append('genre', selectedGenre);
      if (selectedType !== 'all') params.append('type', selectedType);

      const response = await axios.get(
        `http://localhost:3000/api/questions/export/csv?${params}`,
        {
          headers: { Authorization: `Bearer ${auth?.token}` },
          responseType: 'blob',
        }
      );

      // ダウンロード処理
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `questions_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('エクスポート失敗');
      console.error(error);
    }
  };

  const handleDuplicate = async (questionId: number) => {
    const newTitle = prompt('複製後の問題文を入力してください（デフォルト: 元の問題文(コピー)）');
    if (newTitle === null) return; // キャンセル

    try {
      await axios.post(
        `http://localhost:3000/api/questions/${questionId}/duplicate`,
        newTitle ? { title: newTitle } : {},
        {
          headers: { Authorization: `Bearer ${auth?.token}` },
        }
      );
      alert('複製完了！');
      fetchMyQuestions();
    } catch (error) {
      alert('複製失敗');
      console.error(error);
    }
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
              <input
                type="file"
                className="form-control form-control-sm w-auto bg-dark text-white border-secondary"
                accept=".csv"
                onChange={handleFileChange}
              />
              <button
                onClick={handleUploadCsv}
                disabled={loading}
                className="btn btn-primary btn-sm px-4"
              >
                {loading ? '送信中...' : 'アップロード'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* タブ切り替え */}
      <div className="d-flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('my')}
          className={`btn flex-grow-1 py-2 fw-bold ${
            activeTab === 'my' ? 'btn-primary' : 'btn-dark border-secondary text-secondary'
          }`}
        >
          🏢 自社の問題リスト
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`btn flex-grow-1 py-2 fw-bold ${
            activeTab === 'library' ? 'btn-primary' : 'btn-dark border-secondary text-secondary'
          }`}
        >
          📚 共通ライブラリから追加
        </button>
      </div>

      {activeTab === 'my' && (
        <>
          {/* 検索・フィルタバー */}
          <div className="card bg-dark text-light border-secondary mb-4 p-3">
            <div className="row g-2">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control bg-secondary text-white border-secondary"
                  placeholder="🔍 ID・問題文・ジャンルで検索"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className="col-md-3">
                <select
                  className="form-select bg-secondary text-white border-secondary"
                  value={selectedGenre}
                  onChange={(e) => {
                    setSelectedGenre(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">ジャンル: すべて</option>
                  {uniqueGenres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select bg-secondary text-white border-secondary"
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">タイプ: すべて</option>
                  <option value="SINGLE">択一形式</option>
                  <option value="MULTI">複数選択</option>
                </select>
              </div>
              <div className="col-md-2">
                <select
                  className="form-select bg-secondary text-white border-secondary"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={10}>10件表示</option>
                  <option value={25}>25件表示</option>
                  <option value={50}>50件表示</option>
                </select>
              </div>
              <div className="col-md-2 d-flex gap-2">
                <button
                  onClick={handleExportCsv}
                  className="btn btn-success btn-sm flex-grow-1"
                >
                  📥 CSV
                </button>
              </div>
            </div>
          </div>

          {/* 検索結果情報 & 一括削除 */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="alert alert-info mb-0" role="alert">
              検索結果: <strong>{filteredAndSortedQuestions.length}件</strong>
              {filteredAndSortedQuestions.length > 0 && (
                <span className="ms-2 text-muted">
                  ({startIdx + 1}-{Math.min(endIdx, filteredAndSortedQuestions.length)}件目を表示)
                </span>
              )}
            </div>
            {selectedIds.size > 0 && (
              <div>
                <span className="badge bg-warning text-dark me-2">{selectedIds.size}件選択</span>
                <button
                  onClick={handleBatchDelete}
                  className="btn btn-sm btn-danger"
                >
                  🗑️ 一括削除
                </button>
              </div>
            )}
          </div>

          {/* テーブル */}
          {paginatedQuestions.length > 0 ? (
            <div className="card bg-dark text-light border-secondary shadow-lg mb-4">
              <div className="table-responsive">
                <table className="table table-dark table-hover mb-0">
                  <thead>
                    <tr className="border-secondary text-muted small">
                      <th style={{ width: '40px' }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.size === paginatedQuestions.length && paginatedQuestions.length > 0}
                          onChange={toggleSelectAll}
                          className="form-check-input"
                        />
                      </th>
                      <th
                        className="py-3 cursor-pointer"
                        style={{ width: '60px', cursor: 'pointer' }}
                        onClick={() => toggleSort('id')}
                      >
                        ID {getSortIcon('id')}
                      </th>
                      <th
                        className="py-3 cursor-pointer"
                        style={{ width: '160px', cursor: 'pointer' }}
                        onClick={() => toggleSort('genre')}
                      >
                        ジャンル {getSortIcon('genre')}
                      </th>
                      <th className="py-3">問題文</th>
                      <th style={{ width: '100px' }}>タイプ</th>
                      <th style={{ width: '150px' }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedQuestions.map((q) => (
                      <tr key={q.id} className="align-middle border-secondary">
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(q.id)}
                            onChange={() => toggleSelect(q.id)}
                            className="form-check-input"
                          />
                        </td>
                        <td className="text-secondary small">{q.id}</td>
                        <td>
                          <span className="badge bg-info text-dark">{q.genre}</span>
                        </td>
                        <td className="text-truncate" title={q.title}>
                          {q.title}
                        </td>
                        <td className="small">{q.type === 'SINGLE' ? '択一' : '複数'}</td>
                        <td>
                          <button
                            onClick={() => openEditModal(q)}
                            className="btn btn-sm btn-outline-primary me-1"
                          >
                            ✏️ 編集
                          </button>
                          <button
                            onClick={() => handleDuplicate(q.id)}
                            className="btn btn-sm btn-outline-secondary me-1"
                          >
                            📋 複製
                          </button>
                          <button
                            onClick={() => handleDelete(q.id)}
                            className="btn btn-sm btn-outline-danger"
                          >
                            🗑️ 削除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="alert alert-warning" role="alert">
              該当する問題がありません
            </div>
          )}

          {/* ページネーション */}
          {totalPages > 1 && (
            <nav aria-label="Page navigation" className="d-flex justify-content-center">
              <ul className="pagination pagination-sm">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link bg-dark text-light border-secondary"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ← 前へ
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <li
                    key={page}
                    className={`page-item ${currentPage === page ? 'active' : ''}`}
                  >
                    <button
                      className={`page-link ${
                        currentPage === page ? 'bg-primary border-primary' : 'bg-dark text-light border-secondary'
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link bg-dark text-light border-secondary"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    次へ →
                  </button>
                </li>
              </ul>
            </nav>
          )}

          {/* モーダル */}
          {isModalOpen && modalQuestion && (
            <QuestionEditModal
              question={modalQuestion}
              onClose={closeModal}
              onSuccess={handleUpdateSuccess}
              token={auth?.token || ''}
            />
          )}
        </>
      )}

      {activeTab === 'library' && (
        <div className="card bg-dark text-light border-secondary">
          <table className="table table-dark table-hover">
            <thead>
              <tr className="border-secondary text-muted small">
                <th style={{ width: '120px' }}>ジャンル</th>
                <th>問題文</th>
                <th style={{ width: '100px' }}>正解</th>
                <th style={{ width: '100px' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {commonQuestions.map((q) => (
                <tr key={q.id} className="align-middle border-secondary">
                  <td>
                    <span className="badge bg-secondary">{q.genre}</span>
                  </td>
                  <td className="text-truncate" title={q.title}>
                    {q.title}
                  </td>
                  <td>
                    <span className="text-info fw-bold small">{q.answer}</span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleCopy(q.id)}
                      className="btn btn-sm btn-primary px-3"
                    >
                      ➕ 取り込む
                    </button>
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