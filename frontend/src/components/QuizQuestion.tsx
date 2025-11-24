import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

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
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [praiseMessage, setPraiseMessage] = useState('');

  const currentQuestion = questions[currentIndex];
  const options = currentQuestion.choices.split(':').map(opt => opt.trim());

  useEffect(() => {
    setStartTime(new Date());
  }, [currentIndex]);

  const getPraiseMessage = () => {
    const messages = ["天才ですか！？😲", "その調子！🚀", "神レベル！✨", "完璧！💯", "素晴らしい！👏"];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const triggerConfetti = () => {
    // 紙吹雪の色もKoinoboriカラーに合わせる
    const colors = ['#00ADEF', '#004D99', '#FFCF33']; 
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: colors });
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswers.length === 0) {
      alert('解答を選択してください。');
      return;
    }
    if (!startTime) return;

    try {
      const res = await axios.post('/api/quiz/submit_answer', 
        {
          question_id: currentQuestion.id,
          user_answer: selectedAnswers,
          session_id: session_id,
          start_time_iso: startTime.toISOString() 
        },
        { headers: { Authorization: `Bearer ${auth?.token}` } }
      );
      
      const answerResult: AnswerResult = res.data;
      setResult(answerResult);
      setQuizResults([...quizResults, answerResult.is_correct]);

      if (answerResult.is_correct) {
        setPraiseMessage(getPraiseMessage());
        triggerConfetti();
      } else {
        setPraiseMessage("惜しい！次は絶対いけます！🔥");
      }

    } catch (err: any) {
      console.error(err);
      alert('エラーが発生しました。');
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
    setSelectedAnswers(prev => prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]);
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '800px' }}>
      <div className="card shadow-lg">
        <div className="card-header">
          <span className="badge bg-primary" style={{fontSize: '1rem'}}>問題 {currentIndex + 1} / {questions.length}</span>
        </div>
        <div className="card-body p-4">
          <h4 className="card-title mb-5" style={{ lineHeight: '1.8', fontWeight: 'bold' }}>{currentQuestion.title}</h4>
          
          <div className="form-group">
            {options.map((opt) => (
              <div key={opt} className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={opt}
                  value={opt}
                  checked={selectedAnswers.includes(opt)}
                  onChange={() => handleCheckboxChange(opt)}
                  disabled={!!result}
                />
                <label className="form-check-label" htmlFor={opt}>
                  {opt}
                </label>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-4">
            <button 
              className="btn btn-primary btn-lg w-100" 
              onClick={handleSubmitAnswer} 
              disabled={!!result}
              style={{maxWidth: '300px', padding: '15px', fontSize: '1.2rem'}}
            >
              解答する
            </button>
          </div>
        </div>
      </div>

      {/* --- 結果モーダル (白ベースで見やすく修正) --- */}
      {result && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,50,100,0.4)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.3s' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ 
                border: 'none', 
                borderRadius: '24px', 
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }}>
              
              {/* ヘッダー: 正解なら青グラデ、不正解ならグレー */}
              <div className="modal-header text-center justify-content-center" 
                   style={{
                     background: result.is_correct 
                       ? 'linear-gradient(135deg, #00ADEF 0%, #004D99 100%)' 
                       : '#f0f0f0',
                     padding: '30px'
                   }}>
                <h1 className="modal-title m-0" style={{ 
                    fontWeight: '900', 
                    color: result.is_correct ? '#fff' : '#666',
                    fontSize: '2.5rem',
                    textShadow: result.is_correct ? '0 2px 10px rgba(0,0,0,0.2)' : 'none'
                }}>
                  {result.is_correct ? '⭕️ 正　解！' : '❌ 不正解...'}
                </h1>
              </div>
              
              {/* ボディ: 白背景で文字をくっきり */}
              <div className="modal-body text-center p-5" style={{backgroundColor: '#fff', color: '#333'}}>
                <h3 className="mb-4" style={{ color: result.is_correct ? '#00ADEF' : '#ff6b6b', fontWeight: 'bold' }}>
                  {praiseMessage}
                </h3>

                {/* 解説ボックス: 薄い青背景で見やすく */}
                <div className="text-left p-4 rounded" style={{backgroundColor: '#f0f9ff', border: '1px solid #dcebf7', textAlign: 'left'}}>
                  <p className="mb-2 text-muted small" style={{fontWeight: 'bold', textTransform: 'uppercase'}}>正解</p>
                  <h4 className="mb-4" style={{color: '#004D99', fontWeight: 'bold'}}>{result.correct_answer.join(', ')}</h4>
                  
                  {result.explanation && (
                    <>
                      <p className="mb-2 text-muted small" style={{fontWeight: 'bold', textTransform: 'uppercase'}}>解説</p>
                      <p style={{lineHeight: '1.8', color: '#444', fontSize: '1rem'}}>{result.explanation}</p>
                    </>
                  )}
                </div>
              </div>
              
              <div className="modal-footer justify-content-center p-4" style={{backgroundColor: '#fff', borderTop: 'none'}}>
                <button className="btn btn-primary btn-lg px-5" onClick={handleNext} style={{borderRadius: '50px', minWidth: '200px'}}>
                  {currentIndex < questions.length - 1 ? '次へ進む 👉' : '結果を見る 🏆'}
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