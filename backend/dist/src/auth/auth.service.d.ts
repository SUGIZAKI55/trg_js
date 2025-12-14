import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private usersRepository;
    private jwtService;
    constructor(usersRepository: Repository<User>, jwtService: JwtService);
    login(username: string, pass: string): Promise<{
        token: string;
        username: string;
        role: string;
    }>;
    impersonate(targetUserId: number): Promise<{
        token: string;
        username: string;
        role: string;
    }>;
}
