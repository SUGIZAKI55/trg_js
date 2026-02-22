import { LearningLogType, LearningLogInput } from '../types/learning-log.type';
import { LearningLogsService } from '../../learning-logs/learning-logs.service';
import { UsersService } from '../../users/users.service';
export declare class LearningLogsResolver {
    private learningLogsService;
    private usersService;
    constructor(learningLogsService: LearningLogsService, usersService: UsersService);
    learningLogs(context: any): Promise<LearningLogType[]>;
    saveLearningLogs(results: LearningLogInput[], context: any): Promise<LearningLogType[]>;
}
