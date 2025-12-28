import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(username: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        token: string;
        username: any;
        role: any;
        userId: any;
        companyId: any;
        company: {
            name: any;
        };
    }>;
    impersonate(userId: number): Promise<{
        token: string;
        username: string;
        role: string;
        companyId: number;
        company: {
            name: string;
        };
    }>;
}
