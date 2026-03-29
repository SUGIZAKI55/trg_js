import { Repository } from 'typeorm';
import { LearningLog } from '../entities/learning-log.entity';
export interface PatternDiagnosisResult {
    patternType: 'balanced' | 'specialist' | 'growth' | 'improvement' | 'beginner';
    score: number;
    genreStats: {
        [genre: string]: {
            correctRate: number;
            count: number;
        };
    };
    genreConcentration: number;
    growthRate: number;
    recommendation: string;
}
export declare class PatternDiagnosisService {
    private learningLogRepository;
    constructor(learningLogRepository: Repository<LearningLog>);
    diagnosePattern(userId: number): Promise<PatternDiagnosisResult>;
    private calculateGenreStats;
    private calculateOverallCorrectRate;
    private isBalanced;
    private isSpecialist;
    private isGrowth;
    private isImproving;
    private calculateConcentration;
    private calculateGrowthRate;
    private calculateCorrectRate;
    private calculateVariance;
    private createBeginnerDiagnosis;
}
