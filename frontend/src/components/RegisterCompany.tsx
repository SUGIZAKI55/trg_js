import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { companiesApi } from '../services/api';

interface Company {
  id: number;
  name: string;
}

const RegisterCompany: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyName, setCompanyName] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // 画面を開いたときに一覧を取得
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await companiesApi.getAll();
      setCompanies(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName) return;

    try {
      await companiesApi.create(companyName);
      setMessage('会社を登録しました！');
      setCompanyName('');
      fetchCompanies();
    } catch (error) {
      console.error(error);
      setMessage('登録に失敗しました。');
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>会社管理</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/admin')}>戻る</button>
      </div>

      <div className="row">
        {/* 左側：登録フォーム */}
        <div className="col-md-5">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-primary text-white">新規登録</div>
            <div className="card-body">
              {message && <div className="alert alert-info">{message}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">会社名</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="例: 株式会社サンプル"
                  />
                </div>
                <button type="submit" className="btn btn-success w-100">登録する</button>
              </form>
            </div>
          </div>
        </div>

        {/* 右側：一覧表示 */}
        <div className="col-md-7">
          <div className="card shadow-sm">
            <div className="card-header">登録済み会社一覧</div>
            <ul className="list-group list-group-flush">
              {companies.map((c) => (
                <li key={c.id} className="list-group-item d-flex justify-content-between">
                  <span>{c.name}</span>
                  <span className="badge bg-secondary">ID: {c.id}</span>
                </li>
              ))}
              {companies.length === 0 && <li className="list-group-item">データなし</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterCompany;