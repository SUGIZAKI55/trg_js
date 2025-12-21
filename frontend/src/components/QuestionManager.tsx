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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  
  // フォーム入力用ステート
  const [type, setType] = useState('SINGLE'); // SINGLE or MULTIPLE
  const [genre, setGenre] = useState('Business');
  const [title, setTitle] = useState('');
  
  // 選択肢 (A~D)
  const [choiceA, setChoiceA] = useState('');
  const [choiceB, setChoiceB] = useState('');
  const [choiceC, setChoiceC] = useState('');
  const [choiceD, setChoiceD] = useState('');

  // 正解データ (配列で管理。例: ["A"] や ["A", "C"])
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);

  // データ取得
  const fetchQuestions = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/questions', {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      setQuestions(res.data);
    } catch (error) {
      console.error(error);
      alert('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) fetchQuestions();
  }, [auth]);

  // 正解ボタンをクリックした時の処理
  const toggleCorrectAnswer = (key: string) => {
    if (type === 'SINGLE') {
      // 単一選択なら、クリックしたものを唯一の正解にする
      setCorrectAnswers([key]);
    } else {
      // 複数選択なら、配列に追加したり削除したりする
      if (correctAnswers.includes(key)) {
        setCorrectAnswers(correctAnswers.filter((a) => a !== key));
      } else {
        setCorrectAnswers([...correctAnswers, key].sort());
      }
    }
  };

  // 登録処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !choiceA || !choiceB || !choiceC || !choiceD) {
      alert('問題文と4つの選択肢すべてを入力してください');
      return;
    }
    // 複数選択モードで正解なしを許可するかどうかはお好みで。
    // 今回は「正解なし」も許可しますが、警告を出したい場合はここでチェックしてください。

    // サーバーに送る形式に変換
    const formattedChoices = `A:${choiceA}|B:${choiceB}|C:${choiceC}|D:${choiceD}`;
    const formattedAnswer = correctAnswers.join(','); // ["A", "C"] -> "A,C"

    try {
      await axios.post(
        'http://localhost:3000/api/questions',
        {
          type,
          genre,
          title,
          choices: formattedChoices,
          answer: formattedAnswer
        },
        { headers: { Authorization: `Bearer ${auth?.token}` } }
      );
      
      alert('登録しました！');
      // リセット
      setTitle('');
      setChoiceA(''); setChoiceB(''); setChoiceC(''); setChoiceD('');
      setCorrectAnswers([]);
      fetchQuestions();
    } catch (error) {
      console.error(error);
      alert('登録に失敗しました');
    }
  };

  // 削除処理
  const handleDelete = async (id: number) => {
    if (!window.confirm('削除しますか？')) return;
    try {
      await axios.delete(`http://localhost:3000/api/questions/${id}`, {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      setQuestions(questions.filter((q) => q.id !== id));
    } catch (error) {
      alert('削除失敗');
    }
  };

  return (
    <div className="container-main">
      <h2 className="page-title">問題管理 (4択クイズ)</h2>

      {/* --- 作成フォーム --- */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>新規問題作成</h3>
        <form onSubmit={handleSubmit}>
          
          {/* タイプ選択 */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ marginRight: '15px', fontWeight: 'bold' }}>出題タイプ:</label>
            <label style={{ marginRight: '10px' }}>
              <input 
                type="radio" name="type" value="SINGLE" 
                checked={type === 'SINGLE'} 
                onChange={() => { setType('SINGLE'); setCorrectAnswers([]); }} 
              /> 単一選択(1つ)
            </label>
            <label>
              <input 
                type="radio" name="type" value="MULTIPLE" 
                checked={type === 'MULTIPLE'} 
                onChange={() => { setType('MULTIPLE'); setCorrectAnswers([]); }} 
              /> 複数選択(0〜4つ)
            </label>
          </div>

          {/* ジャンルと問題文 */}
          <div style={{ display: 'grid', gap: '10px', marginBottom: '15px' }}>
            <select value={genre} onChange={(e) => setGenre(e.target.value)} style={{ padding: '8px' }}>
              <option value="Business">ビジネスマナー</option>
              <option value="Compliance">コンプライアンス</option>
              <option value="IT">ITセキュリティ</option>
            </select>
            <input 
              type="text" placeholder="問題文を入力" 
              value={title} onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          {/* 4択入力エリア */}
          <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#aaa' }}>
            選択肢を入力し、正解のボタン(A~D)をクリックして色を付けてください
          </p>
          
          <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
            {/* A */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => toggleCorrectAnswer('A')}
                style={{ 
                  width: '40px', height: '40px', borderRadius: '50%', fontWeight: 'bold', cursor: 'pointer',
                  border: '2px solid #646cff',
                  backgroundColor: correctAnswers.includes('A') ? '#646cff' : 'transparent',
                  color: correctAnswers.includes('A') ? '#fff' : '#646cff'
                }}
              >A</button>
              <input type="text" placeholder="選択肢A" value={choiceA} onChange={(e) => setChoiceA(e.target.value)} style={{ flex: 1, padding: '8px' }} />
            </div>
            {/* B */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => toggleCorrectAnswer('B')}
                style={{ 
                  width: '40px', height: '40px', borderRadius: '50%', fontWeight: 'bold', cursor: 'pointer',
                  border: '2px solid #646cff',
                  backgroundColor: correctAnswers.includes('B') ? '#646cff' : 'transparent',
                  color: correctAnswers.includes('B') ? '#fff' : '#646cff'
                }}
              >B</button>
              <input type="text" placeholder="選択肢B" value={choiceB} onChange={(e) => setChoiceB(e.target.value)} style={{ flex: 1, padding: '8px' }} />
            </div>
            {/* C */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => toggleCorrectAnswer('C')}
                style={{ 
                  width: '40px', height: '40px', borderRadius: '50%', fontWeight: 'bold', cursor: 'pointer',
                  border: '2px solid #646cff',
                  backgroundColor: correctAnswers.includes('C') ? '#646cff' : 'transparent',
                  color: correctAnswers.includes('C') ? '#fff' : '#646cff'
                }}
              >C</button>
              <input type="text" placeholder="選択肢C" value={choiceC} onChange={(e) => setChoiceC(e.target.value)} style={{ flex: 1, padding: '8px' }} />
            </div>
            {/* D */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => toggleCorrectAnswer('D')}
                style={{ 
                  width: '40px', height: '40px', borderRadius: '50%', fontWeight: 'bold', cursor: 'pointer',
                  border: '2px solid #646cff',
                  backgroundColor: correctAnswers.includes('D') ? '#646cff' : 'transparent',
                  color: correctAnswers.includes('D') ? '#fff' : '#646cff'
                }}
              >D</button>
              <input type="text" placeholder="選択肢D" value={choiceD} onChange={(e) => setChoiceD(e.target.value)} style={{ flex: 1, padding: '8px' }} />
            </div>
          </div>

          <button type="submit" className="button-primary">この内容で登録</button>
        </form>
      </div>

      {/* --- 一覧表示 --- */}
      <div className="card">
        <h3>登録済み問題</h3>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #444', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>タイプ</th>
              <th style={{ padding: '10px' }}>ジャンル</th>
              <th style={{ padding: '10px' }}>問題文</th>
              <th style={{ padding: '10px' }}>正解</th>
              <th style={{ padding: '10px' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id} style={{ borderBottom: '1px solid #333' }}>
                <td style={{ padding: '10px' }}>
                  <span style={{ 
                    fontSize: '0.8rem', padding: '2px 6px', borderRadius: '4px',
                    backgroundColor: q.type === 'SINGLE' ? '#444' : '#d946ef'
                  }}>
                    {q.type === 'SINGLE' ? '単一' : '複数'}
                  </span>
                </td>
                <td style={{ padding: '10px' }}>{q.genre}</td>
                <td style={{ padding: '10px' }}>{q.title}</td>
                <td style={{ padding: '10px', color: '#8ab4f8', fontWeight: 'bold' }}>{q.answer || '(なし)'}</td>
                <td style={{ padding: '10px' }}>
                  <button onClick={() => handleDelete(q.id)} style={{ color: '#ff4d4d', background: 'none', border: 'none', cursor: 'pointer' }}>削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuestionManager;