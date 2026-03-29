import { LearningLogsService } from './learning-logs.service';
export declare class LearningLogsController {
    private readonly logsService;
    constructor(logsService: LearningLogsService);
    findAll(req: any): Promise<import("../entities/learning-log.entity").LearningLog[]>;
    getAnalysisData(req: any): Promise<any[]>;
    create(body: {
        results: {
            questionId: number;
            isCorrect: boolean;
        }[];
    }, req: any): Promise<import("../entities/learning-log.entity").LearningLog[]>;
}
