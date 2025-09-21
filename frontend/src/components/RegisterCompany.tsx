import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const RegisterCompany: React.FC = () => {
    const { auth } = useAuth();
    const navigate = useNavigate();

    const [companyName, setCompanyName] = useState('');
    const [adminUsername, setAdminUsername] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // ログイン中のユーザーがmaster権限を持っているかチェック
    if (!auth || auth.role !== 'master') {
        // 権限がない場合は管理画面にリダイレクト
        navigate('/admin');
        return null; // コンポーネントをレンダリングしない
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        setIsError(false);

        try {
            const response = await fetch('/api/master/register_company', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.token}`,
                },
                body: JSON.stringify({
                    company_name: companyName,
                    admin_username: adminUsername,
                    admin_password: adminPassword,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || '企業と管理者を正常に登録しました。');
                setIsError(false);
                setCompanyName('');
                setAdminUsername('');
                setAdminPassword('');
            } else {
                setMessage(data.message || '登録に失敗しました。');
                setIsError(true);
            }
        } catch (err: any) {
            setMessage('ネットワークエラーが発生しました。');
            setIsError(true);
            console.error('API登録エラー:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-4">企業・管理者登録</h1>
            {message && (
                <div className={`alert ${isError ? 'alert-danger' : 'alert-success'}`}>
                    {message}
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="companyName">企業名</label>
                    <input
                        type="text"
                        className="form-control"
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="adminUsername">管理者ユーザー名</label>
                    <input
                        type="text"
                        className="form-control"
                        id="adminUsername"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="adminPassword">管理者パスワード</label>
                    <input
                        type="password"
                        className="form-control"
                        id="adminPassword"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary btn-block mt-3" disabled={isLoading}>
                    {isLoading ? '登録中...' : '登録'}
                </button>
            </form>
            <div className="text-center mt-3">
                <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
                    管理画面に戻る
                </button>
            </div>
        </div>
    );
};

export default RegisterCompany;