import React, { useMemo } from 'react';

interface Question {
  id: number;
  type: string;
  genre: string;
  title: string;
  choices: string;
  answer: string;
  companyId?: number;
}

interface QuestionPreviewProps {
  question: Question;
}

const QuestionPreview: React.FC<QuestionPreviewProps> = ({ question }) => {
  // 選択肢を配列に変換
  const choicesArray = useMemo(() => {
    if (!question.choices) return [];
    return question.choices.split('|').filter((c) => c.trim());
  }, [question.choices]);

  // 正解を配列に変換
  const correctAnswers = useMemo(() => {
    if (!question.answer) return [];
    return question.answer.split('|').map((a) => a.trim()).filter((a) => a);
  }, [question.answer]);

  const isAnswerCorrect = (index: number) => {
    const choice = choicesArray[index];
    if (!choice) return false;
    // 選択肢の先頭文字を取得（A, B, C...）
    const choiceKey = String.fromCharCode(65 + index);
    return correctAnswers.includes(choiceKey);
  };

  return (
    <div
      style={{
        backgroundColor: '#1a1a1a',
        border: '1px solid #495057',
        borderRadius: '8px',
        padding: '20px',
        color: '#fff',
      }}
    >
      {/* ジャンル */}
      {question.genre && (
        <div
          style={{
            display: 'inline-block',
            backgroundColor: '#0ea5e9',
            color: '#000',
            padding: '6px 12px',
            borderRadius: '20px',
            marginBottom: '15px',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          【{question.genre}】
        </div>
      )}

      {/* 問題文 */}
      <div style={{ marginBottom: '20px' }}>
        <h5 style={{ margin: '10px 0', fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
          {question.title || 'クリックして問題文を入力...'}
        </h5>
      </div>

      {/* 選択肢 */}
      <div style={{ marginBottom: '20px' }}>
        {choicesArray.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {choicesArray.map((choice, index) => {
              const choiceKey = String.fromCharCode(65 + index);
              const isCorrect = isAnswerCorrect(index);

              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    border: isCorrect ? '2px solid #81c995' : '2px solid #495057',
                    borderRadius: '6px',
                    backgroundColor: isCorrect ? 'rgba(129, 201, 149, 0.1)' : 'rgba(73, 80, 87, 0.3)',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#495057',
                      marginRight: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#fff',
                    }}
                  >
                    {choiceKey}
                  </div>
                  <span style={{ flex: 1, color: isCorrect ? '#81c995' : '#fff' }}>
                    {choice.trim()}
                  </span>
                  {isCorrect && (
                    <span
                      style={{
                        color: '#81c995',
                        fontWeight: 'bold',
                        marginLeft: '8px',
                      }}
                    >
                      ✓ 正解
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              padding: '20px',
              textAlign: 'center',
              color: '#888',
              border: '2px dashed #495057',
              borderRadius: '6px',
              backgroundColor: 'rgba(73, 80, 87, 0.2)',
            }}
          >
            選択肢を入力して下さい
          </div>
        )}
      </div>

      {/* 情報 */}
      <div
        style={{
          paddingTop: '15px',
          borderTop: '1px solid #495057',
          fontSize: '12px',
          color: '#999',
        }}
      >
        <div style={{ marginBottom: '8px' }}>
          <strong>問題ID:</strong> {question.id || '未設定'}
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>タイプ:</strong> {question.type === 'SINGLE' ? '択一形式' : '複数選択形式'}
        </div>
        {correctAnswers.length > 0 && (
          <div>
            <strong>正解キー:</strong> {correctAnswers.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionPreview;
