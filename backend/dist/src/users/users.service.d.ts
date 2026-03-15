import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { LearningLog } from '../entities/learning-log.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { PatternDiagnosisService, PatternDiagnosisResult } from './pattern-diagnosis.service';
export declare class UsersService {
    private usersRepository;
    private learningLogRepository;
    private patternDiagnosisService;
    constructor(usersRepository: Repository<User>, learningLogRepository: Repository<LearningLog>, patternDiagnosisService: PatternDiagnosisService);
    findOneByUsername(username: string): Promise<User | undefined>;
    findAll(currentUser: any): Promise<User[]>;
    findOne(id: number): Promise<User | undefined>;
    create(createUserDto: CreateUserDto): Promise<User>;
    getAnalysisData(currentUser: any): Promise<any[]>;
    remove(id: number): Promise<void>;
    diagnoseAndSavePattern(userId: number): Promise<PatternDiagnosisResult>;
    getPatternDiagnosis(userId: number): Promise<PatternDiagnosisResult | null>;
    private getRecommendationMessage;
}
