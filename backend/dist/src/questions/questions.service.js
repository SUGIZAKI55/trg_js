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
exports.QuestionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const question_entity_1 = require("../entities/question.entity");
let QuestionsService = class QuestionsService {
    constructor(questionRepository) {
        this.questionRepository = questionRepository;
    }
    async getGenres(currentUser) {
        const questions = await this.questionRepository.find({
            where: [
                { companyId: currentUser.companyId },
                { companyId: (0, typeorm_2.IsNull)() }
            ],
            select: ['genre'],
        });
        const genres = questions.map((q) => q.genre);
        return Array.from(new Set(genres)).filter((g) => !!g);
    }
    async getQuizQuestions(genre, count, currentUser) {
        return this.questionRepository.find({
            where: [
                { genre, companyId: currentUser.companyId },
                { genre, companyId: (0, typeorm_2.IsNull)() }
            ],
            take: count,
        });
    }
    async findAll(currentUser) {
        const role = currentUser.role?.toUpperCase();
        if (role === 'MASTER') {
            return this.questionRepository.find({ relations: ['company'] });
        }
        return this.questionRepository.find({
            where: [
                { companyId: currentUser.companyId },
                { companyId: (0, typeorm_2.IsNull)() }
            ],
            relations: ['company'],
        });
    }
    async findCommon() {
        return this.questionRepository.find({ where: { companyId: (0, typeorm_2.IsNull)() } });
    }
    async update(id, updateData, currentUser) {
        const question = await this.questionRepository.findOne({ where: { id } });
        if (!question)
            throw new common_1.NotFoundException('問題が見つかりません');
        const isMaster = currentUser.role?.toUpperCase() === 'MASTER';
        if (!isMaster && question.companyId !== currentUser.companyId) {
            throw new common_1.ForbiddenException('編集権限がありません');
        }
        const { id: _, company, ...validData } = updateData;
        Object.assign(question, validData);
        return this.questionRepository.save(question);
    }
    async copyToCompany(questionId, currentUser) {
        const source = await this.questionRepository.findOne({ where: { id: questionId } });
        if (!source)
            throw new common_1.NotFoundException('コピー元が見つかりません');
        const newQuestion = this.questionRepository.create({
            ...source,
            id: undefined,
            companyId: currentUser.companyId,
        });
        return this.questionRepository.save(newQuestion);
    }
    async remove(id, currentUser) {
        const question = await this.questionRepository.findOne({ where: { id } });
        if (!question)
            throw new common_1.NotFoundException('問題が見つかりません');
        if (currentUser.role?.toUpperCase() !== 'MASTER' && question.companyId !== currentUser.companyId) {
            throw new common_1.ForbiddenException('削除権限がありません');
        }
        await this.questionRepository.remove(question);
    }
    async batchDelete(questionIds, currentUser) {
        if (!questionIds || questionIds.length === 0) {
            throw new Error('削除対象の問題IDが指定されていません');
        }
        const questions = await this.questionRepository.find({
            where: { id: undefined },
        });
        const targetQuestions = await this.questionRepository
            .createQueryBuilder('q')
            .where('q.id IN (:...ids)', { ids: questionIds })
            .getMany();
        if (targetQuestions.length === 0) {
            throw new common_1.NotFoundException('指定された問題が見つかりません');
        }
        const isMaster = currentUser.role?.toUpperCase() === 'MASTER';
        for (const question of targetQuestions) {
            if (!isMaster && question.companyId !== currentUser.companyId) {
                throw new common_1.ForbiddenException('削除権限がない問題が含まれています');
            }
        }
        const result = await this.questionRepository.remove(targetQuestions);
        return {
            deleted: result.length,
            message: `${result.length}件の問題を削除しました`,
        };
    }
    async exportCsv(genre, type, currentUser) {
        let query = this.questionRepository.createQueryBuilder('q');
        if (genre) {
            query = query.where('q.genre = :genre', { genre });
        }
        if (type) {
            query = query.andWhere('q.type = :type', { type });
        }
        if (currentUser && currentUser.role?.toUpperCase() !== 'MASTER') {
            query = query.where('(q.companyId = :companyId OR q.companyId IS NULL)', {
                companyId: currentUser.companyId,
            });
        }
        const questions = await query.getMany();
        const header = ['ID', 'ジャンル', 'タイプ', '問題文', '選択肢', '正解'].join(',');
        const rows = questions.map((q) => {
            const escapedTitle = q.title.includes(',') || q.title.includes('"') ? `"${q.title.replace(/"/g, '""')}"` : q.title;
            const escapedChoices = q.choices.includes(',') || q.choices.includes('"') ? `"${q.choices.replace(/"/g, '""')}"` : q.choices;
            return [q.id, q.genre, q.type, escapedTitle, escapedChoices, q.answer].join(',');
        });
        return [header, ...rows].join('\n');
    }
    async duplicate(questionId, currentUser, newTitle) {
        const source = await this.questionRepository.findOne({ where: { id: questionId } });
        if (!source)
            throw new common_1.NotFoundException('複製元の問題が見つかりません');
        const isMaster = currentUser.role?.toUpperCase() === 'MASTER';
        if (!isMaster && source.companyId !== currentUser.companyId && source.companyId !== null) {
            throw new common_1.ForbiddenException('複製権限がありません');
        }
        const duplicated = this.questionRepository.create({
            ...source,
            id: undefined,
            title: newTitle || `${source.title}(コピー)`,
            companyId: currentUser.companyId,
        });
        return this.questionRepository.save(duplicated);
    }
};
exports.QuestionsService = QuestionsService;
exports.QuestionsService = QuestionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(question_entity_1.Question)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], QuestionsService);
//# sourceMappingURL=questions.service.js.map