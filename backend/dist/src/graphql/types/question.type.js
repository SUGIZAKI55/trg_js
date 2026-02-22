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
exports.UpdateQuestionInput = exports.CreateQuestionInput = exports.QuestionType = void 0;
const graphql_1 = require("@nestjs/graphql");
const company_type_1 = require("./company.type");
let QuestionType = class QuestionType {
};
exports.QuestionType = QuestionType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], QuestionType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], QuestionType.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], QuestionType.prototype, "genre", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], QuestionType.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], QuestionType.prototype, "choices", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], QuestionType.prototype, "answer", void 0);
__decorate([
    (0, graphql_1.Field)(() => company_type_1.CompanyType, { nullable: true }),
    __metadata("design:type", company_type_1.CompanyType)
], QuestionType.prototype, "company", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], QuestionType.prototype, "companyId", void 0);
exports.QuestionType = QuestionType = __decorate([
    (0, graphql_1.ObjectType)()
], QuestionType);
let CreateQuestionInput = class CreateQuestionInput {
};
exports.CreateQuestionInput = CreateQuestionInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateQuestionInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateQuestionInput.prototype, "genre", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateQuestionInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], CreateQuestionInput.prototype, "choices", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], CreateQuestionInput.prototype, "answer", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CreateQuestionInput.prototype, "companyId", void 0);
exports.CreateQuestionInput = CreateQuestionInput = __decorate([
    (0, graphql_1.InputType)()
], CreateQuestionInput);
let UpdateQuestionInput = class UpdateQuestionInput {
};
exports.UpdateQuestionInput = UpdateQuestionInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateQuestionInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateQuestionInput.prototype, "genre", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateQuestionInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], UpdateQuestionInput.prototype, "choices", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], UpdateQuestionInput.prototype, "answer", void 0);
exports.UpdateQuestionInput = UpdateQuestionInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateQuestionInput);
//# sourceMappingURL=question.type.js.map