import { Repository } from 'typeorm';
import { Question } from '../entities/question.entity';
export declare class QuestionsService {
    private readonly questionRepository;
    constructor(questionRepository: Repository<Question>);
    getGenres(currentUser: any): Promise<string[]>;
    getQuizQuestions(genre: string, count: number, currentUser: any): Promise<Question[]>;
    findAll(currentUser: any): Promise<Question[]>;
    findCommon(): Promise<Question[]>;
    update(id: number, updateData: any, currentUser: any): Promise<Question>;
    copyToCompany(questionId: number, currentUser: any): Promise<Question>;
    remove(id: number, currentUser: any): Promise<void>;
}
