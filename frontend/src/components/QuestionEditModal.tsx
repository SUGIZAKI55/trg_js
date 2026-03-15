import React, { useState } from 'react';
import axios from 'axios';
import QuestionPreview from './QuestionPreview';

interface Question {
  id: number;
  type: string;
  genre: string;
  title: string;
  choices: string;
  answer: string;
  companyId?: number;
}

interface QuestionEditModalProps {
  question: Question;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}

const QuestionEditModal: React.FC<QuestionEditModalProps> = ({ question, onClose, onSuccess, token }) => {
  const [formData, setFormData] = useState<Partial<Question>>({ ...question });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof Question, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSave = async () => {
    if (!formData.genre || !formData.title) {
      setError('ジャンルと問題文は必須です');
      return;
    }

    setLoading(true);
    try {
      await axios.patch(`http://localhost:3000/api/questions/${question.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('問題を更新しました ✅');
      onSuccess();
    } catch (err) {
      setError('更新に失敗しました。もう一度お試しください。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* オーバーレイ */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={onClose}
      >
        {/* モーダルコンテナ */}
        <div
          style={{
            backgroundColor: '#1a1a1a',
            borderRadius: '8px',
            border: '1px solid #495057',
            width: '90%',
            maxWidth: '1100px',
            maxHeight: '80vh',
            overflow: 'auto',
            zIndex: 1001,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ヘッダー */}
          <div
            style={{
              backgroundColor: '#2d3748',
              padding: '20px',
              borderBottom: '1px solid #495057',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3 style={{ margin: 0, color: '#fff' }}>問題編集 (ID: {question.id})</h3>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '24px',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>

          {/* コンテンツ */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0',
              height: '100%',
            }}
          >
            {/* 左: フォーム */}
            <div
              style={{
                padding: '20px',
                overflow: 'auto',
                borderRight: '1px solid #495057',
              }}
            >
              {error && (
                <div
                  style={{
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    padding: '12px',
                    borderRadius: '4px',
                    marginBottom: '15px',
                  }}
                >
                  ⚠️ {error}
                </div>
              )}

              {/* ジャンル */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#fff', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                  ジャンル *
                </label>
                <input
                  type="text"
                  className="form-control bg-secondary text-white border-secondary"
                  value={formData.genre || ''}
                  onChange={(e) => handleInputChange('genre', e.target.value)}
                  placeholder="例: IT基礎, セキュリティ"
                />
              </div>

              {/* タイプ */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#fff', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                  問題タイプ
                </label>
                <select
                  className="form-select bg-secondary text-white border-secondary"
                  value={formData.type || 'SINGLE'}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                >
                  <option value="SINGLE">択一形式（1つ選択）</option>
                  <option value="MULTI">複数選択形式（複数選択可）</option>
                </select>
              </div>

              {/* 問題文 */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#fff', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                  問題文 *
                </label>
                <textarea
                  className="form-control bg-secondary text-white border-secondary"
                  rows={4}
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="問題文を入力してください"
                />
              </div>

              {/* 選択肢 */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#fff', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                  選択肢（パイプ | で区切る）
                </label>
                <textarea
                  className="form-control bg-secondary text-white border-secondary"
                  rows={3}
                  value={formData.choices || ''}
                  onChange={(e) => handleInputChange('choices', e.target.value)}
                  placeholder="例: A:はい|B:いいえ|C:わからない"
                />
                <small style={{ color: '#aaa' }}>形式: 選択肢1|選択肢2|選択肢3...</small>
              </div>

              {/* 正解 */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: '#fff', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                  正解キー（複数の場合はパイプ | で区切る）
                </label>
                <input
                  type="text"
                  className="form-control bg-secondary text-white border-secondary"
                  value={formData.answer || ''}
                  onChange={(e) => handleInputChange('answer', e.target.value.toUpperCase())}
                  placeholder="例: A または A,C"
                />
                <small style={{ color: '#aaa' }}>選択肢の先頭文字（A, B, C...）を入力</small>
              </div>

              {/* ボタン */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="btn btn-primary flex-grow-1"
                  style={{ padding: '10px' }}
                >
                  {loading ? '保存中...' : '💾 保存'}
                </button>
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="btn btn-outline-light flex-grow-1"
                  style={{ padding: '10px' }}
                >
                  キャンセル
                </button>
              </div>
            </div>

            {/* 右: プレビュー */}
            <div
              style={{
                padding: '20px',
                overflow: 'auto',
                backgroundColor: '#0d1117',
              }}
            >
              <h6 style={{ color: '#fff', fontWeight: 'bold', marginBottom: '15px' }}>
                📋 プレビュー
              </h6>
              <QuestionPreview question={formData as Question} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuestionEditModal;
