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
    constructor(questionRepo) {
        this.questionRepo = questionRepo;
    }
    async create(createQuestionDto, user) {
        const newQuestion = this.questionRepo.create({
            ...createQuestionDto,
            company: { id: user.companyId }
        });
        return this.questionRepo.save(newQuestion);
    }
    async createFromCsv(fileBuffer) {
        const csvContent = fileBuffer.toString('utf-8');
        const lines = csvContent.split(/\r?\n/);
        const savedQuestions = [];
        const clean = (text) => {
            if (!text)
                return '';
            return text.trim().replace(/^"|"$/g, '');
        };
        for (const line of lines) {
            if (!line.trim())
                continue;
            const cols = line.split(',');
            if (cols.length < 8)
                continue;
            const genre = clean(cols[0]);
            const type = clean(cols[1]).toUpperCase();
            const title = clean(cols[2]);
            const choices = `A:${clean(cols[3])}|B:${clean(cols[4])}|C:${clean(cols[5])}|D:${clean(cols[6])}`;
            const answer = clean(cols[7]);
            const newQuestion = this.questionRepo.create({
                genre,
                type,
                title,
                choices,
                answer,
                company: null
            });
            savedQuestions.push(await this.questionRepo.save(newQuestion));
        }
        return { count: savedQuestions.length, message: 'CSV import successful' };
    }
    async findAll(user) {
        if (user.role === 'MASTER') {
            return this.questionRepo.find({ relations: ['company'] });
        }
        else {
            return this.questionRepo.find({
                where: { company: { id: user.companyId } },
                relations: ['company']
            });
        }
    }
    async findCommon() {
        return this.questionRepo.find({
            where: { company: null },
        });
    }
    async copyToCompany(questionId, user) {
        const original = await this.questionRepo.findOne({
            where: { id: questionId },
            relations: ['company']
        });
        if (!original) {
            throw new common_1.BadRequestException('問題が見つかりません');
        }
        const copy = this.questionRepo.create({
            genre: original.genre,
            type: original.type,
            title: original.title,
            choices: original.choices,
            answer: original.answer,
            company: { id: user.companyId }
        });
        return this.questionRepo.save(copy);
    }
    async remove(id) {
        return this.questionRepo.delete(id);
    }
};
exports.QuestionsService = QuestionsService;
exports.QuestionsService = QuestionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(question_entity_1.Question)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], QuestionsService);
//# sourceMappingURL=questions.service.js.map