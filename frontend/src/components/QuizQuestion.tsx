import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

// (インターフェース定義は変更なし)
interface Question { id: number; title: string; choices: string; explanation: string; }
interface AnswerResult { is_correct: boolean; correct_answer: string[]; explanation: string; }

const QuizQuestion: React.FC = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { questions, session_id } = location.state as { questions: Question[], session_id: string };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [quizResults, setQuizResults] = useState<boolean[]>([]);

  // (関数のロジックは変更なし)
  const currentQuestion = questions[currentIndex];
  const options = currentQuestion.choices.split(':').map(opt => opt.trim());

  const handleSubmitAnswer = async () => {
    if (selectedAnswers.length === 0) {
      alert('解答を選択してください。');
      return;
    }
    try {
      const res = await axios.post('/api/quiz/submit_answer', 
        { question_id: currentQuestion.id, user_answer: selectedAnswers, session_id: session_id },
        { headers: { Authorization: `Bearer ${auth?.token}` } }
      );
      const answerResult: AnswerResult = res.data;
      setResult(answerResult);
      setQuizResults([...quizResults, answerResult.is_correct]);
    } catch (err) {
      // ★★★「動かない」場合、ここにエラーが出ている可能性が高いです★★★
      console.error("解答送信エラー:", err); 
      alert('解答の送信に失敗しました。コンソールを確認してください。');
    }
  };

  const handleNext = () => {
    setResult(null);
    setSelectedAnswers([]);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigate('/kekka', { state: { results: quizResults, total: questions.length } });
    }
  };
  
  const handleCheckboxChange = (option: string) => {
    setSelectedAnswers(prev => 
      prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
    );
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '800px' }}>
      <div className="card">
        {/* (カードヘッダーは変更なし) */}
        <div className="card-header">
          <h5>問題 {currentIndex + 1} / {questions.length}</h5>
        </div>
        <div className="card-body">
          <h4 className="card-title mb-4">{currentQuestion.title}</h4>
          
          <div className="form-group">
            {options.map((opt) => (
              // ★★★ スタイル修正点 1: マージンを追加 ★★★
              <div key={opt} className="form-check mb-2"> 
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={opt}
                  value={opt}
                  checked={selectedAnswers.includes(opt)}
                  onChange={() => handleCheckboxChange(opt)}
                  disabled={!!result}
                />
                {/* ★★★ スタイル修正点 2: ラベルに改行スタイルを適用 ★★★ */}
                <label 
                  className="form-check-label" 
                  htmlFor={opt} 
                  style={{ whiteSpace: 'normal', wordBreak: 'break-word', paddingLeft: '5px' }}
                >
                  {opt}
                </label>
              </div>
            ))}
          </div>
          
          <button 
            className="btn btn-primary" 
            onClick={handleSubmitAnswer} 
            disabled={!!result}
          >
            解答する
          </button>
        </div>
      </div>

      {/* (モーダル部分は変更なし) */}
      {result && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className={`modal-title ${result.is_correct ? 'text-success' : 'text-danger'}`}>
                  {result.is_correct ? '◯ 正解！' : '✕ 不正解…'}
                </h4>
              </div>
              <div className="modal-body">
                <p><strong>正解:</strong> {result.correct_answer.join(', ')}</p>
                {result.explanation && (<p><strong>解説:</strong> {result.explanation}</p>)}
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleNext}>
                  {currentIndex < questions.length - 1 ? '次の問題へ' : '結果を見る'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizQuestion;