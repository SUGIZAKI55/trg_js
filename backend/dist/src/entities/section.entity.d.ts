import { Department } from './department.entity';
import { User } from './user.entity';
export declare class Section {
    id: number;
    name: string;
    department_id: number;
    department: Department;
    users: User[];
}
