import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { learningLogsApi } from '../services/api';

const QuizQuestion: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { auth } = useAuth();
  
  const questions = state?.questions || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  // 回答データを蓄積する状態
  const [userAnswers, setUserAnswers] = useState<{questionId: number, isCorrect: boolean}[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const currentQuestion = questions[currentIndex];

  // 選択肢を「|」で分割
  const choicesArray = currentQuestion?.choices 
    ? currentQuestion.choices.split('|').map((c: string) => c.trim()) 
    : [];

  const handleSelect = (choiceKey: string) => {
    if (currentQuestion.type === 'SINGLE') {
      setSelectedAnswers([choiceKey]);
    } else {
      if (selectedAnswers.includes(choiceKey)) {
        setSelectedAnswers(selectedAnswers.filter(a => a !== choiceKey));
      } else {
        setSelectedAnswers([...selectedAnswers, choiceKey].sort());
      }
    }
  };

  const handleNext = () => {
    if (selectedAnswers.length === 0) return alert("回答を選択してください");

    // ★ 現在の問題の正誤判定
    const isCorrect = selectedAnswers.join(',') === currentQuestion.answer;
    const currentResult = {
      questionId: currentQuestion.id,
      isCorrect: isCorrect
    };
    
    const updatedAnswers = [...userAnswers, currentResult];
    setUserAnswers(updatedAnswers);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswers([]);
    } else {
      // 全問終了時に送信
      submitResults(updatedAnswers);
    }
  };

  const submitResults = async (results: {questionId: number, isCorrect: boolean}[]) => {
    setLoading(true);
    try {
      await learningLogsApi.create(results);

      // 結果表示用のスコア計算
      const correctCount = results.filter(r => r.isCorrect).length;
      const finalScore = Math.round((correctCount / questions.length) * 100);

      navigate('/kekka', { state: { score: finalScore } });
    } catch (err) {
      console.error(err);
      alert("回答の送信に失敗しました。バックエンドのPOST実装を確認してください。");
    } finally {
      setLoading(false);
    }
  };

  if (!currentQuestion) return <div className="text-light p-5 text-center">問題データがありません。</div>;

  return (
    <div className="container mt-5 text-light" style={{ maxWidth: '650px' }}>
      <div className="card bg-dark border-secondary shadow-lg overflow-hidden">
        {/* プログレスバー（視覚的フィードバック） */}
        <div className="progress rounded-0" style={{ height: '4px', backgroundColor: '#333' }}>
          <div 
            className="progress-bar bg-primary" 
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="card-header border-secondary text-secondary d-flex justify-content-between align-items-center bg-dark py-3">
          <span className="badge border border-primary text-primary px-3">{currentQuestion.genre}</span>
          <span className="small fw-bold">Question {currentIndex + 1} of {questions.length}</span>
        </div>
        
        <div className="card-body p-4 p-md-5">
          <h4 className="mb-5 lh-base fw-bold">{currentQuestion.title}</h4>
          
          <div className="d-flex flex-column gap-3">
            {choicesArray.map((choice: string) => {
              const parts = choice.split(':');
              const key = parts[0]?.trim();
              const text = parts[1]?.trim() || choice;
              const isSelected = selectedAnswers.includes(key);

              return (
                <div 
                  key={choice}
                  onClick={() => handleSelect(key)}
                  className={`p-3 border rounded-3 cursor-pointer transition-all d-flex align-items-center ${
                    isSelected ? 'border-primary bg-primary bg-opacity-10 shadow-sm' : 'border-secondary hover-bg-dark'
                  }`}
                  style={{ cursor: 'pointer', backgroundColor: isSelected ? 'rgba(100, 108, 255, 0.08)' : '' }}
                >
                  <div className={`choice-circle me-3 d-flex justify-content-center align-items-center rounded-circle border fw-bold ${
                    isSelected ? 'bg-primary border-primary text-white' : 'border-secondary text-secondary'
                  }`} style={{ width: '36px', height: '36px', flexShrink: 0, fontSize: '0.9rem' }}>
                    {key}
                  </div>
                  <div className="flex-grow-1 fs-5">{text}</div>
                  {currentQuestion.type === 'MULTI' && (
                    <div className={`ms-2 rounded ${isSelected ? 'text-primary' : 'text-muted'}`}>
                      {isSelected ? '●' : '○'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button 
            className="btn btn-primary w-100 btn-lg mt-5 fw-bold py-3 shadow-sm"
            onClick={handleNext}
            disabled={loading}
          >
            {currentIndex + 1 === questions.length ? (loading ? '送信中...' : '解答を終了する') : '次の問題へ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizQuestion;