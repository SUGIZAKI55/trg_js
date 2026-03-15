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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
const learning_log_entity_1 = require("../entities/learning-log.entity");
const pattern_diagnosis_service_1 = require("./pattern-diagnosis.service");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(usersRepository, learningLogRepository, patternDiagnosisService) {
        this.usersRepository = usersRepository;
        this.learningLogRepository = learningLogRepository;
        this.patternDiagnosisService = patternDiagnosisService;
    }
    async findOneByUsername(username) {
        return this.usersRepository.findOne({
            where: { username },
            relations: ['company']
        });
    }
    async findAll(currentUser) {
        console.log('--- UserList Access Debug ---');
        console.log('Current User:', currentUser);
        const role = currentUser.role ? String(currentUser.role).toUpperCase() : '';
        console.log('Normalized Role:', role);
        if (role === 'MASTER') {
            return this.usersRepository.find({
                relations: ['company', 'department', 'section'],
            });
        }
        else {
            return this.usersRepository.find({
                where: {
                    company: { id: currentUser.companyId }
                },
                relations: ['company', 'department', 'section'],
            });
        }
    }
    async findOne(id) {
        return this.usersRepository.findOne({
            where: { id },
            relations: ['company', 'department', 'section']
        });
    }
    async create(createUserDto) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(createUserDto.password || 'password123', salt);
        const normalizedRole = createUserDto.role ? createUserDto.role.toUpperCase() : 'USER';
        const newUser = this.usersRepository.create({
            ...createUserDto,
            role: normalizedRole,
            password: hashedPassword,
        });
        return this.usersRepository.save(newUser);
    }
    async getAnalysisData(currentUser) {
        const userId = Number(currentUser.userId);
        if (!userId || isNaN(userId)) {
            console.error('Invalid userId:', currentUser.userId, 'currentUser:', currentUser);
            return [];
        }
        const logs = await this.learningLogRepository.find({
            where: { user: { id: userId } },
            relations: ['user', 'question'],
            order: { learned_at: 'DESC' }
        });
        return logs.map((log) => ({
            timestamp: log.learned_at.toISOString(),
            question_title: log.question?.title || '',
            is_correct: log.is_correct,
            elapsed_time: null,
            genre: log.question?.genre || '',
            user: {
                id: log.user?.id,
                username: log.user?.username,
            },
            question_id: log.question?.id
        }));
    }
    async remove(id) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`ID ${id} のユーザーは見つかりません。`);
        }
        await this.usersRepository.delete(id);
    }
    async diagnoseAndSavePattern(userId) {
        const diagnosisResult = await this.patternDiagnosisService.diagnosePattern(userId);
        await this.usersRepository.update(userId, {
            patternType: diagnosisResult.patternType,
            patternScore: diagnosisResult.score,
            genreConcentration: diagnosisResult.genreConcentration,
            growthRate: diagnosisResult.growthRate,
            patternDiagnosedAt: new Date(),
        });
        return diagnosisResult;
    }
    async getPatternDiagnosis(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user || !user.patternType) {
            return null;
        }
        return {
            patternType: user.patternType,
            score: user.patternScore || 0,
            genreStats: {},
            genreConcentration: user.genreConcentration || 0,
            growthRate: user.growthRate || 0,
            recommendation: this.getRecommendationMessage(user.patternType),
        };
    }
    getRecommendationMessage(patternType) {
        const messages = {
            balanced: '「バランス型」すべてのジャンルで満遍なく学習しており、幅広い知識が備わっています。',
            specialist: '「専門特化型」得意なジャンルに集中して学習しています。得意分野をさらに深掘りしても良いでしょう。',
            growth: '「成長型」学習を進めるにつれて確実に成績が上がっています。この調子で頑張りましょう！',
            improvement: '「改善型」まだ成績は高くありませんが、着実に改善しています。継続が大事です。',
            beginner: '「初級者」学習をもっと進めることで、より詳しい診断が可能になります。',
        };
        return messages[patternType] || '';
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(learning_log_entity_1.LearningLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        pattern_diagnosis_service_1.PatternDiagnosisService])
], UsersService);
//# sourceMappingURL=users.service.js.map