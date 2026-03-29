import { Repository } from 'typeorm';
import { LearningLog } from '../entities/learning-log.entity';
export interface QuizLogEntry {
    date: string;
    name: string;
    genre: string;
    question_id: number;
    question_title: string;
    user_choice: string[];
    correct_answers: string[];
    result: string;
    kaisetsu: string;
    start_time: string | null;
    end_time: string;
    elapsed_time: number | null;
}
export interface RolePermission {
    role: string;
    displayName: string;
    icon: string;
    description: string;
    features: {
        name: string;
        accessible: boolean;
        description: string;
    }[];
    actions: string[];
}
export interface RoleFlowData {
    roles: RolePermission[];
    flow: {
        step: number;
        title: string;
        options: {
            role: string;
            access: string;
            features: string[];
        }[];
    };
}
export declare class AdminService {
    private readonly logRepository;
    constructor(logRepository: Repository<LearningLog>);
    getAllLogs(currentUser: any): Promise<QuizLogEntry[]>;
    getRolePermissions(): RoleFlowData;
}
