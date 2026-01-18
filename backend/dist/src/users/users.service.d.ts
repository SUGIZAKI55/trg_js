import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    findOneByUsername(username: string): Promise<User | undefined>;
    findAll(currentUser: any): Promise<User[]>;
    findOne(id: number): Promise<User | undefined>;
    create(createUserDto: CreateUserDto): Promise<User>;
    remove(id: number): Promise<void>;
}
