import { QuestionsService } from './questions.service';
export declare class QuestionsController {
    private readonly questionsService;
    constructor(questionsService: QuestionsService);
    getGenres(req: any): Promise<string[]>;
    getQuizStart(genre: string, count: string, req: any): Promise<import("../entities/question.entity").Question[]>;
    findAll(req: any): Promise<import("../entities/question.entity").Question[]>;
    findCommon(): Promise<import("../entities/question.entity").Question[]>;
    update(id: string, updateData: any, req: any): Promise<import("../entities/question.entity").Question>;
    copy(id: string, req: any): Promise<import("../entities/question.entity").Question>;
    remove(id: string, req: any): Promise<void>;
}
