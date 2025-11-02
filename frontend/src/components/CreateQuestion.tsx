import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

// (インターフェース定義は変更なし)
interface QuestionFormData {
  genre: string;
  title: string;
  choices: string[]; 
  answer: string[];
  explanation: string;
}

const CreateQuestion: React.FC = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const questionId = location.state?.questionId;
  const isEditing = !!questionId;

  const [formData, setFormData] = useState<QuestionFormData>({
    genre: '',
    title: '',
    choices: ['', '', '', ''],
    answer: [],
    explanation: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // (useEffectやロジック部分は変更なし)
  useEffect(() => {
    if (isEditing && auth?.token) {
      setLoading(true);
      const fetchQuestionData = async () => {
        try {
          const res = await axios.get(`/api/questions/${questionId}`, {
            headers: { Authorization: `Bearer ${auth.token}` },
          });
          setFormData({
            ...res.data,
            choices: res.data.choices ? res.data.choices.split(':') : ['', '', '', ''],
            answer: res.data.answer ? res.data.answer.split(':') : [],
          });
        } catch (err) {
          setError('問題データの読み込みに失敗しました。');
        } finally {
          setLoading(false);
        }
      };
      fetchQuestionData();
    }
  }, [isEditing, questionId, auth?.token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChoiceChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newChoices = [...prev.choices];
      newChoices[index] = value;
      return { ...prev, choices: newChoices };
    });
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map((option) => option.value);
    setFormData((prev) => ({ ...prev, answer: selectedOptions }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    if (!auth?.token) {
      setError('認証エラー。');
      setLoading(false);
      return;
    }
    const dataToSend = {
      ...formData,
      choices: formData.choices.join(':'),
      answer: formData.answer.join(':'),
    };
    try {
      if (isEditing) {
        await axios.put(`/api/questions/${questionId}`, dataToSend, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setSuccess('問題が正常に更新されました。');
      } else {
        await axios.post('/api/questions', dataToSend, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setSuccess('問題が正常に作成されました。');
        setFormData({ genre: '', title: '', choices: ['', '', '', ''], answer: [], explanation: '' });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '操作に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return <div className="container mt-5 text-center"><h2>問題データを読み込み中...</h2></div>;
  }
  
  // ★★★ 修正点: maxWidthを 800px から 960px に変更 ★★★
  return (
    <div className="container" style={{ maxWidth: '1140px' }}>
      
      <div className="card shadow">
        <div className="card-body p-4 p-md-5">

          <h1 className="text-center mb-4">
            {isEditing ? '問題の編集' : '新規問題の作成'}
          </h1>
          
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            {/* --- 1. 問題設定グループ --- */}
            <fieldset className="mb-4">
              <legend className="form-label h6">1. 問題設定</legend>
              <div className="form-group mb-3">
                <label htmlFor="genre" className="form-label">ジャンル</label>
                <input
                  type="text"
                  className="form-control"
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  placeholder="例: 簿記:仕訳"
                  required
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="title" className="form-label">問題文</label>
                <textarea
                  className="form-control"
                  id="title"
                  name="title"
                  rows={4}
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="例: 買掛金¥60,000の支払いのために..."
                  required
                />
              </div>
            </fieldset>

            {/* --- 2. 選択肢と解答グループ --- */}
            <fieldset className="mb-4">
              <legend className="form-label h6">2. 選択肢と解答</legend>
              <div className="form-group mb-3">
                <label className="form-label">選択肢 (4つすべて入力)</label>
                {formData.choices.map((choice, index) => (
                  <input
                    key={index}
                    type="text"
                    className="form-control mb-2"
                    placeholder={`選択肢 ${index + 1}`}
                    value={choice}
                    onChange={(e) => handleChoiceChange(index, e.target.value)}
                    required
                  />
                ))}
              </div>
              <div className="form-group mb-3">
                <label htmlFor="answer" className="form-label">正解</label>
                <select
                  id="answer"
                  className="form-select"
                  multiple
                  value={formData.answer}
                  onChange={handleAnswerChange}
                  required
                  style={{ minHeight: '120px' }}
                >
                  {formData.choices.map((choice, index) =>
                    choice.trim() ? (
                      <option key={index} value={choice}>
                        選択肢 {index + 1}: {choice.substring(0, 50)}...
                      </option>
                    ) : null
                  )}
                </select>
                <small className="form-text">Ctrl (Windows) / Command (Mac) で複数選択できます。</small>
              </div>
            </fieldset>

            {/* --- 3. 解説グループ --- */}
            <fieldset className="mb-4">
              <legend className="form-label h6">3. 解説 (任意)</legend>
              <div className="form-group mb-3">
                <textarea
                  className="form-control"
                  id="explanation"
                  name="explanation"
                  rows={3}
                  value={formData.explanation}
                  onChange={handleChange}
                  placeholder="例: 売上割引は、収益の控除項目として..."
                />
              </div>
            </fieldset>
            
            <hr className="my-4" style={{borderColor: '#444'}}/>

            {/* --- ボタン --- */}
            <div className="d-flex justify-content-between">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
              >
                {loading ? '処理中...' : (isEditing ? '更新する' : '作成する')}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate('/q_list')}
              >
                一覧に戻る
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default CreateQuestion;