import { QuestionType } from '../types/question.type';
import { QuestionsService } from '../../questions/questions.service';
export declare class QuestionsResolver {
    private questionsService;
    constructor(questionsService: QuestionsService);
    questions(context: any): Promise<QuestionType[]>;
    commonQuestions(): Promise<QuestionType[]>;
    questionGenres(context: any): Promise<string[]>;
    quizQuestions(genre: string, count: number, context: any): Promise<QuestionType[]>;
    private convertQuestion;
    private parseChoices;
    private parseAnswer;
}
