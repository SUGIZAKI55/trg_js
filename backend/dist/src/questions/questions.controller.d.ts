import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
export declare class QuestionsController {
    private readonly questionsService;
    constructor(questionsService: QuestionsService);
    create(createQuestionDto: CreateQuestionDto, req: any): Promise<import("../entities/question.entity").Question>;
    findAll(req: any): Promise<import("../entities/question.entity").Question[]>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
