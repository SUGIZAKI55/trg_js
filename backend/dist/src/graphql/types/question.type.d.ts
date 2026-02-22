import { CompanyType } from './company.type';
export declare class QuestionType {
    id: number;
    type: string;
    genre: string;
    title: string;
    choices: string[];
    answer: string[];
    company?: CompanyType;
    companyId?: number;
}
export declare class CreateQuestionInput {
    type: string;
    genre: string;
    title: string;
    choices: string[];
    answer: string[];
    companyId?: number;
}
export declare class UpdateQuestionInput {
    type?: string;
    genre?: string;
    title?: string;
    choices?: string[];
    answer?: string[];
}
