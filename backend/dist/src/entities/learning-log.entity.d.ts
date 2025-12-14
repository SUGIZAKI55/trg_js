import { User } from './user.entity';
import { Question } from './question.entity';
export declare class LearningLog {
    id: number;
    learned_at: Date;
    is_correct: boolean;
    user: User;
    question: Question;
}
