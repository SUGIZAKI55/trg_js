import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const CreateQuestion: React.FC = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const questionId = location.state?.questionId;
  const isEditing = !!questionId;

  const [formData, setFormData] = useState({ genre: '', title: '', choices: ['','','',''], answer: [] as string[], explanation: '' });
  
  useEffect(() => {
    if (isEditing && auth?.token) {
      axios.get(`/api/questions/${questionId}`, { headers: { Authorization: `Bearer ${auth.token}` } })
        .then(res => setFormData({ ...res.data, choices: res.data.choices.split(':'), answer: res.data.answer.split(':') }));
    }
  }, [isEditing, auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, choices: formData.choices.join(':'), answer: formData.answer.join(':') };
    try {
      if (isEditing) await axios.put(`/api/questions/${questionId}`, payload, { headers: { Authorization: `Bearer ${auth?.token}` } });
      else await axios.post('/api/questions', payload, { headers: { Authorization: `Bearer ${auth?.token}` } });
      navigate('/q_list');
    } catch { alert("エラー"); }
  };

  return (
    <div className="container-main" style={{maxWidth:'800px'}}>
      <div className="text-center mb-5">
        <h1 className="page-title">{isEditing ? '問題編集' : '新規作成'}</h1>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/q_list')}>戻る</button>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">ジャンル</label>
              <input className="form-control" value={formData.genre} onChange={e=>setFormData({...formData, genre:e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">問題文</label>
              <textarea className="form-control" rows={3} value={formData.title} onChange={e=>setFormData({...formData, title:e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">選択肢 (4つ)</label>
              {formData.choices.map((c, i) => (
                <input key={i} className="form-control mb-2" value={c} onChange={e=>{
                  const nc=[...formData.choices]; nc[i]=e.target.value; setFormData({...formData, choices:nc});
                }} required />
              ))}
            </div>
            <div className="form-group">
              <label className="form-label">正解 (複数可)</label>
              <select className="form-select" multiple value={formData.answer} onChange={e=>setFormData({...formData, answer: Array.from(e.target.selectedOptions, o=>o.value)})}>
                {formData.choices.map(c => c && <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">解説</label>
              <textarea className="form-control" rows={3} value={formData.explanation} onChange={e=>setFormData({...formData, explanation:e.target.value})} />
            </div>
            <button className="btn btn-primary w-100" type="submit">保存</button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default CreateQuestion;