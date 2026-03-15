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
exports.SectionType = exports.DepartmentType = exports.CompanyType = void 0;
const graphql_1 = require("@nestjs/graphql");
let CompanyType = class CompanyType {
};
exports.CompanyType = CompanyType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CompanyType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CompanyType.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], CompanyType.prototype, "is_active", void 0);
__decorate([
    (0, graphql_1.Field)(() => [DepartmentType], { nullable: true }),
    __metadata("design:type", Array)
], CompanyType.prototype, "departments", void 0);
__decorate([
    (0, graphql_1.Field)(() => [Object], { nullable: true }),
    __metadata("design:type", Array)
], CompanyType.prototype, "users", void 0);
__decorate([
    (0, graphql_1.Field)(() => [Object], { nullable: true }),
    __metadata("design:type", Array)
], CompanyType.prototype, "courses", void 0);
exports.CompanyType = CompanyType = __decorate([
    (0, graphql_1.ObjectType)()
], CompanyType);
let DepartmentType = class DepartmentType {
};
exports.DepartmentType = DepartmentType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], DepartmentType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], DepartmentType.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], DepartmentType.prototype, "company_id", void 0);
__decorate([
    (0, graphql_1.Field)(() => [SectionType], { nullable: true }),
    __metadata("design:type", Array)
], DepartmentType.prototype, "sections", void 0);
exports.DepartmentType = DepartmentType = __decorate([
    (0, graphql_1.ObjectType)()
], DepartmentType);
let SectionType = class SectionType {
};
exports.SectionType = SectionType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SectionType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SectionType.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SectionType.prototype, "department_id", void 0);
exports.SectionType = SectionType = __decorate([
    (0, graphql_1.ObjectType)()
], SectionType);
//# sourceMappingURL=company.type.js.map