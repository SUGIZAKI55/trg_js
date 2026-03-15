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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningLogInput = exports.DashboardData = exports.LearningLogType = exports.OverallStats = exports.GenreStats = void 0;
const graphql_1 = require("@nestjs/graphql");
const user_type_1 = require("./user.type");
const question_type_1 = require("./question.type");
let GenreStats = class GenreStats {
};
exports.GenreStats = GenreStats;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], GenreStats.prototype, "genre", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], GenreStats.prototype, "count", void 0);
exports.GenreStats = GenreStats = __decorate([
    (0, graphql_1.ObjectType)()
], GenreStats);
let OverallStats = class OverallStats {
};
exports.OverallStats = OverallStats;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], OverallStats.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], OverallStats.prototype, "correct", void 0);
exports.OverallStats = OverallStats = __decorate([
    (0, graphql_1.ObjectType)()
], OverallStats);
let LearningLogType = class LearningLogType {
};
exports.LearningLogType = LearningLogType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], LearningLogType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], LearningLogType.prototype, "learned_at", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], LearningLogType.prototype, "is_correct", void 0);
__decorate([
    (0, graphql_1.Field)(() => user_type_1.UserType, { nullable: true }),
    __metadata("design:type", user_type_1.UserType)
], LearningLogType.prototype, "user", void 0);
__decorate([
    (0, graphql_1.Field)(() => question_type_1.QuestionType, { nullable: true }),
    __metadata("design:type", question_type_1.QuestionType)
], LearningLogType.prototype, "question", void 0);
exports.LearningLogType = LearningLogType = __decorate([
    (0, graphql_1.ObjectType)()
], LearningLogType);
let DashboardData = class DashboardData {
};
exports.DashboardData = DashboardData;
__decorate([
    (0, graphql_1.Field)(() => [GenreStats]),
    __metadata("design:type", Array)
], DashboardData.prototype, "genre_stats", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], DashboardData.prototype, "review_count", void 0);
__decorate([
    (0, graphql_1.Field)(() => OverallStats, { nullable: true }),
    __metadata("design:type", OverallStats)
], DashboardData.prototype, "overall_stats", void 0);
exports.DashboardData = DashboardData = __decorate([
    (0, graphql_1.ObjectType)()
], DashboardData);
let LearningLogInput = class LearningLogInput {
};
exports.LearningLogInput = LearningLogInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], LearningLogInput.prototype, "questionId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], LearningLogInput.prototype, "is_correct", void 0);
exports.LearningLogInput = LearningLogInput = __decorate([
    (0, graphql_1.InputType)()
], LearningLogInput);
//# sourceMappingURL=learning-log.type.js.map