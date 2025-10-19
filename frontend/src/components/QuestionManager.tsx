import React, { useState } from "react";

const QuestionManager: React.FC = () => {
  // 状態
  const [result, setResult] = useState<string>("");

  // 問題データ（例）
  const question = "太陽はどの方向から昇る？";
  const options = ["北", "南", "東", "西"];
  const correct = "東";

  // クリック時
  const handleClick = (answer: string) => {
    if (answer === correct) {
      setResult("◯ 正解！");
    } else {
      setResult("✕ 不正解…");
    }
  };

  return (
    <div className="container mt-5" style={{ textAlign: "center" }}>
      <h1>4択クイズ</h1>
      <p style={{ fontSize: "20px", margin: "20px 0" }}>{question}</p>

      {/* 選択肢ボタン */}
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => handleClick(opt)}   // ← onclick ではなく onClick！
          style={{
            margin: "8px",
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          {opt}
        </button>
      ))}

      {/* 結果表示 */}
      <p style={{ fontSize: "24px", marginTop: "20px" }}>{result}</p>
    </div>
  );
};

export default QuestionManager;