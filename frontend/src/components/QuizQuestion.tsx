import React, { useState, useEffect } from 'react';
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

  // ★★★ 1. 問題の表示開始時刻を保存するstateを追加 ★★★
  const [startTime, setStartTime] = useState<Date | null>(null);

  const currentQuestion = questions[currentIndex];
  const options = currentQuestion.choices.split(':').map(opt => opt.trim());

  // ★★★ 2. 問題が切り替わるたびに、開始時刻を記録する ★★★
  useEffect(() => {
    // 新しい問題が表示されたので、現在時刻を記録
    setStartTime(new Date()); 
  }, [currentIndex]); // currentIndexが変わるたびに実行

  // 解答を送信する処理
  const handleSubmitAnswer = async () => {
    if (selectedAnswers.length === 0) {
      alert('解答を選択してください。');
      return;
    }
    // ★★★ 3. startTimeが記録されているか確認 ★★★
    if (!startTime) {
      alert('エラー: 開始時刻が記録されていません。');
      return;
    }

    try {
      const res = await axios.post('/api/quiz/submit_answer', 
        {
          question_id: currentQuestion.id,
          user_answer: selectedAnswers,
          session_id: session_id,
          // ★★★ 4. 記録した開始時刻 (ISO形式) をAPIに送信 ★★★
          start_time_iso: startTime.toISOString() 
        },
        { headers: { Authorization: `Bearer ${auth?.token}` } }
      );
      
      const answerResult: AnswerResult = res.data;
      setResult(answerResult); 
      setQuizResults([...quizResults, answerResult.is_correct]);
      
    } catch (err: any) {
      console.error("解答送信エラー:", err); 
      alert(err.response?.data?.message || '解答の送信に失敗しました。');
    }
  };

  // (handleNext, handleCheckboxChange は変更なし)
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
      prev.includes(option) 
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  // (return文の見た目は変更なし)
  return (
    <div className="container mt-5" style={{ maxWidth: '800px' }}>
      <div className="card">
        <div className="card-header">
          <h5>問題 {currentIndex + 1} / {questions.length}</h5>
        </div>
        <div className="card-body">
          <h4 className="card-title mb-4">{currentQuestion.title}</h4>
          
          <div className="form-group">
            {options.map((opt) => (
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