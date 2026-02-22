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
exports.QuestionsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const question_type_1 = require("../types/question.type");
const questions_service_1 = require("../../questions/questions.service");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
let QuestionsResolver = class QuestionsResolver {
    constructor(questionsService) {
        this.questionsService = questionsService;
    }
    async questions(context) {
        const questions = await this.questionsService.findAll(context.req.user);
        return questions.map(q => this.convertQuestion(q));
    }
    async commonQuestions() {
        const questions = await this.questionsService.findCommon();
        return questions.map(q => this.convertQuestion(q));
    }
    async questionGenres(context) {
        return this.questionsService.getGenres(context.req.user);
    }
    async quizQuestions(genre, count, context) {
        const questions = await this.questionsService.getQuizQuestions(genre, count, context.req.user);
        return questions.map(q => this.convertQuestion(q));
    }
    convertQuestion(question) {
        return {
            ...question,
            choices: this.parseChoices(question.choices),
            answer: this.parseAnswer(question.answer),
        };
    }
    parseChoices(choicesStr) {
        if (!choicesStr)
            return [];
        try {
            if (choicesStr.startsWith('[')) {
                return JSON.parse(choicesStr);
            }
            return choicesStr.split('|').map(c => c.trim());
        }
        catch {
            return [choicesStr];
        }
    }
    parseAnswer(answerStr) {
        if (!answerStr)
            return [];
        return answerStr.split(',').map(a => a.trim());
    }
};
exports.QuestionsResolver = QuestionsResolver;
__decorate([
    (0, graphql_1.Query)(() => [question_type_1.QuestionType]),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], QuestionsResolver.prototype, "questions", null);
__decorate([
    (0, graphql_1.Query)(() => [question_type_1.QuestionType]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], QuestionsResolver.prototype, "commonQuestions", null);
__decorate([
    (0, graphql_1.Query)(() => [String]),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], QuestionsResolver.prototype, "questionGenres", null);
__decorate([
    (0, graphql_1.Query)(() => [question_type_1.QuestionType]),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('genre')),
    __param(1, (0, graphql_1.Args)('count', { type: () => graphql_1.Int })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", Promise)
], QuestionsResolver.prototype, "quizQuestions", null);
exports.QuestionsResolver = QuestionsResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [questions_service_1.QuestionsService])
], QuestionsResolver);
//# sourceMappingURL=questions.resolver.js.map