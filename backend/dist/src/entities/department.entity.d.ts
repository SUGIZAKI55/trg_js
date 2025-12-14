import { Company } from './company.entity';
import { Section } from './section.entity';
import { User } from './user.entity';
export declare class Department {
    id: number;
    name: string;
    company_id: number;
    company: Company;
    sections: Section[];
    users: User[];
}
