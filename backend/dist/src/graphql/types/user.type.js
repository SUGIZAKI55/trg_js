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
exports.AuthPayload = exports.UserType = exports.CompanyInfo = void 0;
const graphql_1 = require("@nestjs/graphql");
const company_type_1 = require("./company.type");
const learning_log_type_1 = require("./learning-log.type");
let CompanyInfo = class CompanyInfo {
};
exports.CompanyInfo = CompanyInfo;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CompanyInfo.prototype, "name", void 0);
exports.CompanyInfo = CompanyInfo = __decorate([
    (0, graphql_1.ObjectType)()
], CompanyInfo);
let UserType = class UserType {
};
exports.UserType = UserType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], UserType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], UserType.prototype, "username", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], UserType.prototype, "role", void 0);
__decorate([
    (0, graphql_1.Field)(() => company_type_1.CompanyType),
    __metadata("design:type", company_type_1.CompanyType)
], UserType.prototype, "company", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], UserType.prototype, "companyId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Object)
], UserType.prototype, "department", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Object)
], UserType.prototype, "section", void 0);
__decorate([
    (0, graphql_1.Field)(() => [learning_log_type_1.LearningLogType], { nullable: true }),
    __metadata("design:type", Array)
], UserType.prototype, "learningLogs", void 0);
exports.UserType = UserType = __decorate([
    (0, graphql_1.ObjectType)()
], UserType);
let AuthPayload = class AuthPayload {
};
exports.AuthPayload = AuthPayload;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AuthPayload.prototype, "token", void 0);
__decorate([
    (0, graphql_1.Field)(() => UserType),
    __metadata("design:type", UserType)
], AuthPayload.prototype, "user", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AuthPayload.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AuthPayload.prototype, "username", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AuthPayload.prototype, "role", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AuthPayload.prototype, "companyId", void 0);
__decorate([
    (0, graphql_1.Field)(() => CompanyInfo, { nullable: true }),
    __metadata("design:type", CompanyInfo)
], AuthPayload.prototype, "company", void 0);
exports.AuthPayload = AuthPayload = __decorate([
    (0, graphql_1.ObjectType)()
], AuthPayload);
//# sourceMappingURL=user.type.js.map