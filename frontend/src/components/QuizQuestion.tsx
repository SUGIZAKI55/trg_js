import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti'; // ★追加: 紙吹雪ライブラリ

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
  
  // ★追加: ヨイショ用メッセージ
  const [praiseMessage, setPraiseMessage] = useState('');

  const currentQuestion = questions[currentIndex];
  const options = currentQuestion.choices.split(':').map(opt => opt.trim());

  useEffect(() => {
    setStartTime(new Date());
  }, [currentIndex]);

  // ★追加: ランダムでベタ褒めする関数
  const getPraiseMessage = () => {
    const messages = [
      "天才ですか！？😲",
      "その調子！無敵ですね！🚀",
      "神レベルの正解！✨",
      "素晴らしすぎます！👏",
      "完璧！言うことなし！💯",
      "今日のあなたは輝いてます！🌟",
      "知能指数爆上がり中！🧠"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // ★追加: 紙吹雪を派手に飛ばす関数
  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // 左右から発射！
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
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

      // ★★★ ここで演出を分岐 ★★★
      if (answerResult.is_correct) {
        setPraiseMessage(getPraiseMessage()); // 褒め言葉をセット
        triggerConfetti(); // 紙吹雪発射！
      } else {
        setPraiseMessage("惜しい！次は絶対いけます！🔥"); // 不正解時の励まし
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
      <div className="card shadow">
        <div className="card-header">
          <h5>問題 {currentIndex + 1} / {questions.length}</h5>
        </div>
        <div className="card-body p-4">
          <h4 className="card-title mb-4" style={{ lineHeight: '1.6' }}>{currentQuestion.title}</h4>
          
          <div className="form-group">
            {options.map((opt) => (
              <div key={opt} className="form-check mb-3 p-3 border rounded" style={{ backgroundColor: '#2a2a2a' }}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={opt}
                  value={opt}
                  checked={selectedAnswers.includes(opt)}
                  onChange={() => handleCheckboxChange(opt)}
                  disabled={!!result}
                  style={{ transform: 'scale(1.3)', marginLeft: '0.5rem' }}
                />
                <label 
                  className="form-check-label w-100" 
                  htmlFor={opt} 
                  style={{ whiteSpace: 'normal', wordBreak: 'break-word', paddingLeft: '1rem', cursor: 'pointer', fontSize: '1.1rem' }}
                >
                  {opt}
                </label>
              </div>
            ))}
          </div>
          
          <button 
            className="btn btn-primary btn-lg w-100 mt-3" 
            onClick={handleSubmitAnswer} 
            disabled={!!result}
          >
            解答する
          </button>
        </div>
      </div>

      {/* --- 結果モーダル (ヨイショ仕様) --- */}
      {result && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.7)', animation: 'fadeIn 0.3s' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg" style={{ border: result.is_correct ? '4px solid #ffd700' : '1px solid #444' }}>
              
              <div className={`modal-header ${result.is_correct ? 'bg-warning text-dark' : 'bg-danger text-white'}`}>
                {/* 巨大な判定テキスト */}
                <h2 className="modal-title w-100 text-center font-weight-bold">
                  {result.is_correct ? '🎉 正　解！ 🎉' : '😢 不正解...'}
                </h2>
              </div>
              
              <div className="modal-body text-center p-4">
                {/* ヨイショメッセージ */}
                <h3 className="mb-4" style={{ color: result.is_correct ? '#ffeb3b' : '#ff9999', fontWeight: 'bold' }}>
                  {praiseMessage}
                </h3>

                <div className="text-left bg-dark p-3 rounded">
                  <p className="mb-1 text-muted">正解:</p>
                  <h5 className="text-success mb-3">{result.correct_answer.join(', ')}</h5>
                  
                  {result.explanation && (
                    <>
                      <p className="mb-1 text-muted">解説:</p>
                      <p>{result.explanation}</p>
                    </>
                  )}
                </div>
              </div>
              
              <div className="modal-footer justify-content-center">
                <button className="btn btn-light btn-lg px-5 font-weight-bold" onClick={handleNext}>
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