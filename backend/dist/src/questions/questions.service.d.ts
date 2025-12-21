import { Repository } from 'typeorm';
import { Question } from '../entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
export declare class QuestionsService {
    private questionRepo;
    constructor(questionRepo: Repository<Question>);
    create(createQuestionDto: CreateQuestionDto, user: any): Promise<Question>;
    findAll(user: any): Promise<Question[]>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
