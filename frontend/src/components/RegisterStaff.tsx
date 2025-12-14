import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Company {
  id: number;
  name: string;
}

const RegisterStaff: React.FC = () => {
  const navigate = useNavigate();
  
  // フォームの入力値
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff'); // デフォルトは一般
  const [companyId, setCompanyId] = useState('');
  
  // 会社一覧データ
  const [companies, setCompanies] = useState<Company[]>([]);
  const [message, setMessage] = useState('');

  // 画面を開いたら会社一覧を取得（プルダウン用）
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/companies');
        setCompanies(res.data);
      } catch (err) {
        console.error("会社一覧取得エラー", err);
      }
    };
    fetchCompanies();
  }, []);

  // 登録ボタンを押したとき
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setMessage('ユーザー名とパスワードは必須です');
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/users', {
        username,
        password,
        role,
        companyId: companyId ? Number(companyId) : null,
      });
      setMessage('✅ ユーザー登録成功！');
      // フォームをクリア
      setUsername('');
      setPassword('');
      setCompanyId('');
    } catch (err) {
      console.error(err);
      setMessage('❌ 登録に失敗しました');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>スタッフ登録</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/users')}>一覧へ戻る</button>
      </div>

      <div className="card shadow">
        <div className="card-body">
          {message && <div className={`alert ${message.includes('成功') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}
          
          <form onSubmit={handleSubmit}>
            {/* ユーザー名 */}
            <div className="mb-3">
              <label className="form-label">ユーザーID (ログイン名)</label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="例: user01"
              />
            </div>

            {/* パスワード */}
            <div className="mb-3">
              <label className="form-label">パスワード</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワードを入力"
              />
            </div>

            {/* 権限選択 */}
            <div className="mb-3">
              <label className="form-label">権限 (Role)</label>
              <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="staff">一般 (staff)</option>
                <option value="admin">管理者 (admin)</option>
                <option value="MASTER">マスター (MASTER)</option>
              </select>
            </div>

            {/* 所属会社選択 */}
            <div className="mb-3">
              <label className="form-label">所属会社</label>
              <select className="form-select" value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
                <option value="">所属なし</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary w-100">登録する</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterStaff;