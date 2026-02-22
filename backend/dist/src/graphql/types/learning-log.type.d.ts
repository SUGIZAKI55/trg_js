import { UserType } from './user.type';
import { QuestionType } from './question.type';
export declare class GenreStats {
    genre: string;
    count: number;
}
export declare class OverallStats {
    total: number;
    correct: number;
}
export declare class LearningLogType {
    id: number;
    learned_at: Date;
    is_correct: boolean;
    user?: UserType;
    question?: QuestionType;
}
export declare class DashboardData {
    genre_stats: GenreStats[];
    review_count: number;
    overall_stats?: OverallStats;
}
export declare class LearningLogInput {
    questionId: number;
    is_correct: boolean;
}
