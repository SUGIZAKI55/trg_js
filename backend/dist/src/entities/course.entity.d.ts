import { Company } from './company.entity';
export declare class Course {
    id: number;
    title: string;
    description: string;
    is_shared: boolean;
    company_id: number;
    company: Company;
    question_ids_json: string;
}
