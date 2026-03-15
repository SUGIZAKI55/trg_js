import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getDashboardData(req: any): {
        username: any;
        review_count: number;
        genre_stats: {
            Business: number;
            IT: number;
            Compliance: number;
        };
    };
    create(createUserDto: CreateUserDto): Promise<import("../entities/user.entity").User>;
    findAll(req: any): Promise<import("../entities/user.entity").User[]>;
    getPatternDiagnosis(id: string): Promise<import("./pattern-diagnosis.service").PatternDiagnosisResult>;
    runPatternDiagnosis(id: string): Promise<import("./pattern-diagnosis.service").PatternDiagnosisResult>;
    forcePatternDiagnosis(id: string): Promise<import("./pattern-diagnosis.service").PatternDiagnosisResult>;
    findOne(id: string): Promise<import("../entities/user.entity").User>;
    getAnalysisData(req: any): Promise<any[]>;
    remove(id: string): Promise<void>;
}
