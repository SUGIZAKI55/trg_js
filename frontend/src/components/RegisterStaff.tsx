import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usersApi, companiesApi } from '../services/api';

interface Company {
  id: number;
  name: string;
}

const RegisterStaff: React.FC = () => {
  const navigate = useNavigate();
  const { auth } = useAuth(); // 現在ログインしているユーザーの情報を取得
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // ★初期値を 'USER' (大文字) に変更
  const [role, setRole] = useState('USER');
  const [companyId, setCompanyId] = useState('');
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [message, setMessage] = useState('');

  // ログインユーザーがMASTER権限かどうか
  const isMaster = auth?.role?.toUpperCase() === 'MASTER';

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await companiesApi.getAll();
        setCompanies(res.data);
      } catch (err) {
        console.error("会社一覧取得エラー", err);
      }
    };
    if (auth?.token) fetchCompanies();
  }, [auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password || !companyId) {
      setMessage('❌ 全ての必須項目を入力してください');
      return;
    }

    try {
      await usersApi.create({
        username,
        password,
        role,
        companyId: Number(companyId),
      });

      setMessage('✅ ユーザー登録成功！');
      // 3秒後に一覧へ戻る（ユーザー体験の向上）
      setTimeout(() => navigate('/users'), 2000);
    } catch (err) {
      console.error(err);
      setMessage('❌ 登録に失敗しました。ユーザー名が重複している可能性があります。');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-light">ユーザー新規登録</h2>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/users')}>一覧へ戻る</button>
      </div>

      <div className="card shadow-sm bg-dark text-light border-secondary">
        <div className="card-body">
          {message && (
            <div className={`alert ${message.includes('成功') ? 'alert-success' : 'alert-danger'}`}>
              {message}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">ユーザーID (ログイン名)</label>
              <input
                type="text"
                className="form-control bg-secondary text-white border-0"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="例: sato_staff"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">パスワード</label>
              <input
                type="password"
                className="form-control bg-secondary text-white border-0"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワードを入力"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">権限 (Role)</label>
              <select 
                className="form-select bg-secondary text-white border-0" 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="USER">一般スタッフ (USER)</option>
                <option value="ADMIN">部門管理者 (ADMIN)</option>
                <option value="SUPER_ADMIN">企業代表・管理者 (SUPER_ADMIN)</option>
                {/* ログインユーザーがMASTERの場合のみ、MASTERの作成を許可 */}
                {isMaster && <option value="MASTER">システムマスター (MASTER)</option>}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">所属会社 <span className="text-danger">*必須</span></label>
              <select 
                className="form-select bg-secondary text-white border-0" 
                value={companyId} 
                onChange={(e) => setCompanyId(e.target.value)}
                required
              >
                <option value="" disabled>-- 企業を選択してください --</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <button 
                type="submit" 
                className="btn btn-primary w-100 fw-bold"
                disabled={!username || !password || !companyId}
              >
                この内容で登録する
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterStaff;