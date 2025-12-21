export class CreateQuestionDto {
    type: string; // ← 追加
    genre: string;
    title: string;
    choices: string;
    answer: string;
  }