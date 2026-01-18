import { Company } from './company.entity';
import { Department } from './department.entity';
import { Section } from './section.entity';
import { LearningLog } from './learning-log.entity';
export declare class User {
    id: number;
    username: string;
    password: string;
    role: string;
    company: Company;
    companyId: number;
    department: Department;
    departmentId: number;
    section: Section;
    sectionId: number;
    learningLogs: LearningLog[];
}
