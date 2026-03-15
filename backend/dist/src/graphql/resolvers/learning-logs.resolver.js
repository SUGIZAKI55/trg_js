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
exports.LearningLogsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const learning_log_type_1 = require("../types/learning-log.type");
const learning_logs_service_1 = require("../../learning-logs/learning-logs.service");
const users_service_1 = require("../../users/users.service");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
let LearningLogsResolver = class LearningLogsResolver {
    constructor(learningLogsService, usersService) {
        this.learningLogsService = learningLogsService;
        this.usersService = usersService;
    }
    async learningLogs(context) {
        const logs = await this.learningLogsService.findAll(context.req.user);
        return logs;
    }
    async saveLearningLogs(results, context) {
        const mappedResults = results.map(r => ({
            questionId: r.questionId,
            isCorrect: r.is_correct,
        }));
        const logs = await this.learningLogsService.createLogs(context.req.user, mappedResults);
        return logs;
    }
};
exports.LearningLogsResolver = LearningLogsResolver;
__decorate([
    (0, graphql_1.Query)(() => [learning_log_type_1.LearningLogType]),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LearningLogsResolver.prototype, "learningLogs", null);
__decorate([
    (0, graphql_1.Mutation)(() => [learning_log_type_1.LearningLogType]),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('results', { type: () => [learning_log_type_1.LearningLogInput] })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], LearningLogsResolver.prototype, "saveLearningLogs", null);
exports.LearningLogsResolver = LearningLogsResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [learning_logs_service_1.LearningLogsService,
        users_service_1.UsersService])
], LearningLogsResolver);
//# sourceMappingURL=learning-logs.resolver.js.map