import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getDashboardData(req: any): {
        username: any;
        review_count: number;
        genre_stats: {
            JavaScript: number;
            React: number;
            NestJS: number;
            TypeScript: number;
            CSS: number;
        };
    };
    create(createUserDto: CreateUserDto): Promise<import("../entities/user.entity").User>;
    findAll(): Promise<import("../entities/user.entity").User[]>;
    findOne(id: string): Promise<import("../entities/user.entity").User>;
}
