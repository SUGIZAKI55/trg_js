import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../services/api';

interface RolePermission {
  role: string;
  displayName: string;
  icon: string;
  description: string;
  features: {
    name: string;
    accessible: boolean;
    description: string;
  }[];
  actions: string[];
}

interface FlowOption {
  role: string;
  access: string;
  features: string[];
}

interface RoleFlowData {
  roles: RolePermission[];
  flow: {
    step: number;
    title: string;
    options: FlowOption[];
  };
}

const RolePermissions: React.FC = () => {
  const [roleData, setRoleData] = useState<RoleFlowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedRole, setExpandedRole] = useState<string>('MASTER');
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoleData = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getRoles();
        setRoleData(res.data);
      } catch (error) {
        console.error('Failed to load role data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (auth?.token) {
      fetchRoleData();
    }
  }, [auth?.token]);

  if (loading) {
    return <div className="container mt-5 text-center">読み込み中...</div>;
  }

  if (!roleData) {
    return <div className="container mt-5 alert alert-danger">データの読み込みに失敗しました</div>;
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'MASTER':
        return '#ffd700'; // Gold
      case 'ADMIN':
        return '#4a90e2'; // Blue
      case 'USER':
        return '#7ed321'; // Green
      default:
        return '#999';
    }
  };

  const getRoleBackgroundColor = (role: string) => {
    switch (role) {
      case 'MASTER':
        return '#fff8dc';
      case 'ADMIN':
        return '#e8f1ff';
      case 'USER':
        return '#f0f8e8';
      default:
        return '#f5f5f5';
    }
  };

  return (
    <div className="container-main">
      <div className="text-center mb-5">
        <h1 className="page-title">権限管理 & 動作フロー</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
          管理画面に戻る
        </button>
      </div>

      {/* ロール判定フロー図 */}
      <div className="card shadow-sm mb-5" style={{ backgroundColor: '#f9f9f9' }}>
        <div className="card-header" style={{ backgroundColor: '#333', color: '#fff' }}>
          <h5 className="mb-0">🔄 ロール判定フロー</h5>
        </div>
        <div className="card-body p-4">
          {/* ステップ1: ユーザーログイン */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div
              style={{
                background: '#333',
                color: '#fff',
                padding: '20px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                display: 'inline-block',
                minWidth: '200px',
              }}
            >
              👤 ユーザーログイン
            </div>
          </div>

          {/* 矢印 */}
          <div style={{ textAlign: 'center', marginBottom: '40px', fontSize: '24px' }}>↓</div>

          {/* ロール判定 */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                background: '#f28b82',
                color: '#fff',
                padding: '15px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                display: 'inline-block',
                minWidth: '200px',
              }}
            >
              🔐 ロール判定
            </div>
          </div>

          {/* 矢印 */}
          <div style={{ textAlign: 'center', marginBottom: '40px', fontSize: '24px' }}>↓</div>

          {/* ロール別アクセス権限 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '30px',
              marginTop: '30px',
            }}
          >
            {roleData.flow.options.map((option) => (
              <div
                key={option.role}
                style={{
                  background: getRoleBackgroundColor(option.role),
                  border: `2px solid ${getRoleColor(option.role)}`,
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '24px',
                    marginBottom: '10px',
                    color: getRoleColor(option.role),
                  }}
                >
                  {roleData.roles.find((r) => r.role === option.role)?.icon}
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#333',
                    marginBottom: '10px',
                  }}
                >
                  {option.role}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#666',
                    marginBottom: '15px',
                    padding: '10px',
                    background: 'rgba(255,255,255,0.5)',
                    borderRadius: '4px',
                  }}
                >
                  {option.access}
                </div>
                <div style={{ fontSize: '11px', color: '#555' }}>
                  <strong>アクセス可能:</strong>
                  <div style={{ marginTop: '5px' }}>
                    {option.features.map((feature, idx) => (
                      <div key={idx} style={{ padding: '3px 0' }}>
                        ✓ {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ロール詳細情報 */}
      <div className="card shadow-sm">
        <div className="card-header" style={{ backgroundColor: '#333', color: '#fff' }}>
          <h5 className="mb-0">📋 ロール詳細情報</h5>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gap: '30px' }}>
            {roleData.roles.map((role) => (
              <div
                key={role.role}
                style={{
                  border: `2px solid ${getRoleColor(role.role)}`,
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                {/* ロールヘッダー */}
                <div
                  style={{
                    background: getRoleColor(role.role),
                    color: '#000',
                    padding: '15px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onClick={() =>
                    setExpandedRole(expandedRole === role.role ? '' : role.role)
                  }
                >
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    {role.icon} {role.displayName}
                  </div>
                  <div style={{ fontSize: '20px' }}>
                    {expandedRole === role.role ? '▼' : '▶'}
                  </div>
                </div>

                {/* ロール説明 */}
                <div
                  style={{
                    padding: '15px',
                    background: getRoleBackgroundColor(role.role),
                    borderBottom: `1px solid ${getRoleColor(role.role)}`,
                  }}
                >
                  <p style={{ marginBottom: 0, color: '#555' }}>
                    {role.description}
                  </p>
                </div>

                {/* 展開可能な詳細 */}
                {expandedRole === role.role && (
                  <div style={{ padding: '20px' }}>
                    {/* 機能一覧 */}
                    <div style={{ marginBottom: '30px' }}>
                      <h6 style={{ fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>
                        📌 アクセス可能な機能:
                      </h6>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        {role.features.map((feature, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '12px',
                              borderRadius: '6px',
                              background: feature.accessible ? '#e8f5e9' : '#f5f5f5',
                              border: `1px solid ${feature.accessible ? '#81c995' : '#ccc'}`,
                            }}
                          >
                            <div
                              style={{
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: feature.accessible ? '#2e7d32' : '#999',
                                marginBottom: '5px',
                              }}
                            >
                              {feature.accessible ? '✓' : '✗'} {feature.name}
                            </div>
                            <div
                              style={{
                                fontSize: '11px',
                                color: '#666',
                              }}
                            >
                              {feature.description}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* アクション一覧 */}
                    <div>
                      <h6 style={{ fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>
                        🎯 実行可能なアクション:
                      </h6>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {role.actions.map((action, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '8px 15px',
                              background: getRoleColor(role.role),
                              color: role.role === 'MASTER' ? '#000' : '#fff',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                            }}
                          >
                            {action}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 凡例 */}
      <div className="card shadow-sm mt-5" style={{ backgroundColor: '#f9f9f9' }}>
        <div className="card-header" style={{ backgroundColor: '#333', color: '#fff' }}>
          <h5 className="mb-0">📚 凡例</h5>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <strong>👑 MASTER</strong>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                最高権限を持つ管理者。システム全体の設定変更やすべてのユーザーのデータにアクセス可能。
              </p>
            </div>
            <div>
              <strong>🔐 ADMIN</strong>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                会社レベルの管理者。同じ会社のユーザーとデータのみ管理可能。
              </p>
            </div>
            <div>
              <strong>👤 USER</strong>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                一般ユーザー。自分の学習データと分析結果のみ閲覧・操作可能。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolePermissions;
