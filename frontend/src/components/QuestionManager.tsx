import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Question {
  id: number;
  type: string;
  genre: string;
  title: string;
  choices: string;
  answer: string;
  company?: { name: string };
}

const QuestionManager: React.FC = () => {
  const { auth } = useAuth();
  
  // 表示モード (my: 自社問題, library: 共通ライブラリ)
  const [activeTab, setActiveTab] = useState<'my' | 'library'>('my');

  // データ
  const [myQuestions, setMyQuestions] = useState<Question[]>([]);
  const [commonQuestions, setCommonQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  // CSVアップロード用
  const [file, setFile] = useState<File | null>(null);

  // 通常作成フォーム用
  const [type, setType] = useState('SINGLE');
  const [genre, setGenre] = useState('Business');
  const [title, setTitle] = useState('');
  const [choiceA, setChoiceA] = useState('');
  const [choiceB, setChoiceB] = useState('');
  const [choiceC, setChoiceC] = useState('');
  const [choiceD, setChoiceD] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);

  // --- 初期データの読み込み ---
  useEffect(() => {
    if (auth?.token) {
      fetchMyQuestions();
      fetchCommonQuestions();
    }
  }, [auth]);

  // 自社問題の取得
  const fetchMyQuestions = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/questions', {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      setMyQuestions(res.data);
    } catch (err) { console.error(err); }
  };

  // 共通ライブラリの取得
  const fetchCommonQuestions = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/questions/common', {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      setCommonQuestions(res.data);
    } catch (err) { console.error(err); }
  };

  // --- CSVアップロード (Masterのみ) ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadCsv = async () => {
    if (!file) {
      alert('ファイルを選択してください');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:3000/api/questions/upload', formData, {
        headers: { 
          Authorization: `Bearer ${auth?.token}`,
          'Content-Type': 'multipart/form-data'
        },
      });
      alert(`${res.data.count}件の問題を登録しました！`);
      fetchCommonQuestions(); // ライブラリ一覧を更新
      setFile(null);
    } catch (error) {
      console.error(error);
      alert('アップロードに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // --- コピー機能 (ライブラリ -> 自社) ---
  const handleCopy = async (questionId: number) => {
    if (!window.confirm('この問題を自社リストにコピーしますか？')) return;
    try {
      await axios.post(`http://localhost:3000/api/questions/${questionId}/copy`, {}, {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      alert('コピーしました！「自社の問題」タブを確認してください。');
      fetchMyQuestions(); // 自社リストを更新
    } catch (error) {
      console.error(error);
      alert('コピーに失敗しました');
    }
  };

  // --- 通常削除 ---
  const handleDelete = async (id: number) => {
    if (!window.confirm('削除しますか？')) return;
    try {
      await axios.delete(`http://localhost:3000/api/questions/${id}`, {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      // 両方のリストから消してみる（簡易対応）
      setMyQuestions(myQuestions.filter((q) => q.id !== id));
      setCommonQuestions(commonQuestions.filter((q) => q.id !== id));
    } catch (error) {
      alert('削除失敗');
    }
  };

  // --- UIコンポーネント: タブ切り替え ---
  return (
    <div className="container-main">
      <h2 className="page-title">問題管理</h2>

      {/* マスター専用: CSVアップロードエリア */}
      {auth?.role === 'MASTER' && (
        <div className="card" style={{ marginBottom: '20px', borderLeft: '5px solid #646cff' }}>
          <h3>📂 CSV一括登録 (Master Only)</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input type="file" accept=".csv,.txt" onChange={handleFileChange} />
            <button onClick={handleUploadCsv} disabled={loading} className="button-primary">
              {loading ? '送信中...' : 'アップロード'}
            </button>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '5px' }}>
            形式: ジャンル,タイプ,問題文,A,B,C,D,正解
          </p>
        </div>
      )}

      {/* タブメニュー */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('my')}
          style={{ 
            flex: 1, padding: '10px', cursor: 'pointer', border: 'none',
            backgroundColor: activeTab === 'my' ? '#646cff' : '#333',
            color: 'white', fontWeight: 'bold'
          }}
        >
          🏢 自社の問題リスト
        </button>
        <button 
          onClick={() => setActiveTab('library')}
          style={{ 
            flex: 1, padding: '10px', cursor: 'pointer', border: 'none',
            backgroundColor: activeTab === 'library' ? '#646cff' : '#333',
            color: 'white', fontWeight: 'bold'
          }}
        >
          📚 共通ライブラリ (追加する)
        </button>
      </div>

      {/* --- タブ1: 自社問題リスト (通常のCRUD) --- */}
      {activeTab === 'my' && (
        <div className="card">
          <h3>自社で出題する問題</h3>
          <p style={{ fontSize: '0.9rem', color: '#aaa' }}>
            ここにある問題が、社員の受講画面に表示されます。
          </p>
          <table className="table" style={{ width: '100%', marginTop: '10px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #555' }}>
                <th>ID</th><th>タイプ</th><th>ジャンル</th><th>問題文</th><th>操作</th>
              </tr>
            </thead>
            <tbody>
              {myQuestions.map((q) => (
                <tr key={q.id} style={{ borderBottom: '1px solid #333' }}>
                  <td>{q.id}</td>
                  <td>{q.type}</td>
                  <td>{q.genre}</td>
                  <td>{q.title}</td>
                  <td>
                    <button onClick={() => handleDelete(q.id)} style={{ color: '#ff4d4d', background: 'none', border: 'none', cursor: 'pointer' }}>削除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- タブ2: 共通ライブラリ (コピー機能) --- */}
      {activeTab === 'library' && (
        <div className="card">
          <h3>全社共通問題ライブラリ</h3>
          <p style={{ fontSize: '0.9rem', color: '#aaa' }}>
            マスターが登録した問題です。「取り込む」ボタンを押すと、自社のリストに追加されます。
          </p>
          <table className="table" style={{ width: '100%', marginTop: '10px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #555' }}>
                <th>ID</th><th>タイプ</th><th>ジャンル</th><th>問題文</th><th>正解</th><th>操作</th>
              </tr>
            </thead>
            <tbody>
              {commonQuestions.map((q) => (
                <tr key={q.id} style={{ borderBottom: '1px solid #333' }}>
                  <td>{q.id}</td>
                  <td>{q.type}</td>
                  <td>{q.genre}</td>
                  <td>{q.title}</td>
                  <td>{q.answer}</td>
                  <td>
                    <button 
                      onClick={() => handleCopy(q.id)} 
                      className="button-primary"
                      style={{ fontSize: '0.8rem', padding: '5px 10px' }}
                    >
                      ＋ 取り込む
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