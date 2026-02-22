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
exports.CompaniesResolver = exports.CreateCompanyInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const company_type_1 = require("../types/company.type");
const companies_service_1 = require("../../companies/companies.service");
let CreateCompanyInput = class CreateCompanyInput {
};
exports.CreateCompanyInput = CreateCompanyInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateCompanyInput.prototype, "name", void 0);
exports.CreateCompanyInput = CreateCompanyInput = __decorate([
    (0, graphql_1.InputType)()
], CreateCompanyInput);
let CompaniesResolver = class CompaniesResolver {
    constructor(companiesService) {
        this.companiesService = companiesService;
    }
    async companies() {
        return this.companiesService.findAll();
    }
};
exports.CompaniesResolver = CompaniesResolver;
__decorate([
    (0, graphql_1.Query)(() => [company_type_1.CompanyType]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CompaniesResolver.prototype, "companies", null);
exports.CompaniesResolver = CompaniesResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [companies_service_1.CompaniesService])
], CompaniesResolver);
//# sourceMappingURL=companies.resolver.js.map