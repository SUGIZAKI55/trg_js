"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatternDiagnosisService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const learning_log_entity_1 = require("../entities/learning-log.entity");
let PatternDiagnosisService = class PatternDiagnosisService {
    constructor(learningLogRepository) {
        this.learningLogRepository = learningLogRepository;
    }
    async diagnosePattern(userId) {
        const logs = await this.learningLogRepository.find({
            where: { user: { id: userId } },
            relations: ['question'],
            order: { learned_at: 'ASC' }
        });
        if (logs.length < 5) {
            return this.createBeginnerDiagnosis();
        }
        const genreStats = this.calculateGenreStats(logs);
        let patternType;
        let score;
        let genreConcentration;
        let growthRate;
        let recommendation;
        const overallCorrectRate = this.calculateOverallCorrectRate(logs);
        const genreArray = Object.entries(genreStats);
        const correctRates = genreArray.map(([_, stats]) => stats.correctRate);
        if (this.isBalanced(correctRates)) {
            patternType = 'balanced';
            score = Math.min(100, overallCorrectRate);
            genreConcentration = this.calculateConcentration(correctRates);
            growthRate = this.calculateGrowthRate(logs);
            recommendation = '「バランス型」すべてのジャンルで満遍なく学習しており、幅広い知識が備わっています。';
        }
        else if (this.isSpecialist(correctRates)) {
            patternType = 'specialist';
            score = Math.min(100, Math.max(...correctRates));
            genreConcentration = this.calculateConcentration(correctRates);
            growthRate = this.calculateGrowthRate(logs);
            recommendation = '「専門特化型」得意なジャンルに集中して学習しています。得意分野をさらに深掘りしても良いでしょう。';
        }
        else if (this.isGrowth(logs)) {
            patternType = 'growth';
            score = Math.min(100, overallCorrectRate * 1.2);
            genreConcentration = this.calculateConcentration(correctRates);
            growthRate = this.calculateGrowthRate(logs);
            recommendation = '「成長型」学習を進めるにつれて確実に成績が上がっています。この調子で頑張りましょう！';
        }
        else if (this.isImproving(logs)) {
            patternType = 'improvement';
            score = overallCorrectRate * 0.8 + 10;
            genreConcentration = this.calculateConcentration(correctRates);
            growthRate = this.calculateGrowthRate(logs);
            recommendation = '「改善型」まだ成績は高くありませんが、着実に改善しています。継続が大事です。';
        }
        else {
            patternType = 'beginner';
            score = overallCorrectRate;
            genreConcentration = this.calculateConcentration(correctRates);
            growthRate = this.calculateGrowthRate(logs);
            recommendation = '「初級者」学習をもっと進めることで、より詳しい診断が可能になります。';
        }
        return {
            patternType,
            score: Math.round(score),
            genreStats,
            genreConcentration: Math.round(genreConcentration),
            growthRate: Math.round(growthRate * 100) / 100,
            recommendation
        };
    }
    calculateGenreStats(logs) {
        const stats = {};
        logs.forEach(log => {
            const genre = log.question?.genre || 'Unknown';
            if (!stats[genre]) {
                stats[genre] = { correct: 0, total: 0 };
            }
            stats[genre].total++;
            if (log.is_correct) {
                stats[genre].correct++;
            }
        });
        const result = {};
        Object.entries(stats).forEach(([genre, data]) => {
            result[genre] = {
                correctRate: (data.correct / data.total) * 100,
                count: data.total
            };
        });
        return result;
    }
    calculateOverallCorrectRate(logs) {
        if (logs.length === 0)
            return 0;
        const correct = logs.filter(log => log.is_correct).length;
        return (correct / logs.length) * 100;
    }
    isBalanced(correctRates) {
        if (correctRates.length < 2)
            return false;
        const avgRate = correctRates.reduce((a, b) => a + b, 0) / correctRates.length;
        const allAbove70 = correctRates.every(rate => rate >= 70);
        const variance = this.calculateVariance(correctRates);
        return allAbove70 && variance <= 15;
    }
    isSpecialist(correctRates) {
        if (correctRates.length < 2)
            return false;
        const maxRate = Math.max(...correctRates);
        const minRate = Math.min(...correctRates);
        const difference = maxRate - minRate;
        return difference >= 30 && maxRate >= 70;
    }
    isGrowth(logs) {
        const midpoint = Math.floor(logs.length / 2);
        const firstHalf = logs.slice(0, midpoint);
        const secondHalf = logs.slice(midpoint);
        if (firstHalf.length === 0 || secondHalf.length === 0)
            return false;
        const firstHalfRate = this.calculateCorrectRate(firstHalf);
        const secondHalfRate = this.calculateCorrectRate(secondHalf);
        const growthRate = ((secondHalfRate - firstHalfRate) / firstHalfRate) * 100;
        return growthRate >= 20 && secondHalfRate >= 60;
    }
    isImproving(logs) {
        const overallRate = this.calculateOverallCorrectRate(logs);
        const growthRate = this.calculateGrowthRate(logs);
        return overallRate < 60 && growthRate > 10;
    }
    calculateConcentration(correctRates) {
        if (correctRates.length < 2)
            return 0;
        const maxRate = Math.max(...correctRates);
        const minRate = Math.min(...correctRates);
        return Math.min(100, maxRate - minRate);
    }
    calculateGrowthRate(logs) {
        const midpoint = Math.floor(logs.length / 2);
        const firstHalf = logs.slice(0, midpoint);
        const secondHalf = logs.slice(midpoint);
        if (firstHalf.length === 0)
            return 0;
        const firstHalfRate = this.calculateCorrectRate(firstHalf);
        const secondHalfRate = this.calculateCorrectRate(secondHalf);
        if (firstHalfRate === 0)
            return 0;
        return ((secondHalfRate - firstHalfRate) / firstHalfRate) * 100;
    }
    calculateCorrectRate(logs) {
        if (logs.length === 0)
            return 0;
        const correct = logs.filter(log => log.is_correct).length;
        return (correct / logs.length) * 100;
    }
    calculateVariance(values) {
        if (values.length === 0)
            return 0;
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
        const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
        return Math.sqrt(variance);
    }
    createBeginnerDiagnosis() {
        return {
            patternType: 'beginner',
            score: 0,
            genreStats: {},
            genreConcentration: 0,
            growthRate: 0,
            recommendation: '「初級者」学習をもっと進めることで、より詳しい診断が可能になります。'
        };
    }
};
exports.PatternDiagnosisService = PatternDiagnosisService;
exports.PatternDiagnosisService = PatternDiagnosisService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(learning_log_entity_1.LearningLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PatternDiagnosisService);
//# sourceMappingURL=pattern-diagnosis.service.js.map