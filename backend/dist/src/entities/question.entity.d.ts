import { Company } from './company.entity';
export declare class Question {
    id: number;
    type: string;
    genre: string;
    title: string;
    choices: string;
    answer: string;
    companyId: number;
    company: Company;
}
