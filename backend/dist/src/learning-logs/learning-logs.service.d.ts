import { Repository } from 'typeorm';
import { LearningLog } from '../entities/learning-log.entity';
export declare class LearningLogsService {
    private readonly logRepository;
    constructor(logRepository: Repository<LearningLog>);
    findAll(currentUser: any): Promise<LearningLog[]>;
    createLogs(currentUser: any, results: {
        questionId: number;
        isCorrect: boolean;
    }[]): Promise<LearningLog[]>;
}
