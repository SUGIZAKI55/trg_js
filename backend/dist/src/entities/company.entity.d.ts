import { User } from './user.entity';
import { Department } from './department.entity';
import { Course } from './course.entity';
export declare class Company {
    id: number;
    name: string;
    is_active: boolean;
    departments: Department[];
    users: User[];
    courses: Course[];
}
