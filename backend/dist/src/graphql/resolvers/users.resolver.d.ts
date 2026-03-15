import { UserType } from '../types/user.type';
import { UsersService } from '../../users/users.service';
export declare class CreateUserInput {
    username: string;
    password?: string;
    role?: string;
    companyId?: number;
}
export declare class UsersResolver {
    private usersService;
    constructor(usersService: UsersService);
    users(): Promise<UserType[]>;
    user(id: number): Promise<UserType>;
}
