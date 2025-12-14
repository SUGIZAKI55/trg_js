import { Company } from './company.entity';
import { Department } from './department.entity';
import { Section } from './section.entity';
export declare class User {
    id: number;
    username: string;
    password_hash: string;
    role: string;
    company_id: number;
    company: Company;
    department_id: number;
    department: Department;
    section_id: number;
    section: Section;
}
