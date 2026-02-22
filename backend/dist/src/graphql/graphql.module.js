"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphqlModule = void 0;
const common_1 = require("@nestjs/common");
const auth_resolver_1 = require("./resolvers/auth.resolver");
const users_resolver_1 = require("./resolvers/users.resolver");
const companies_resolver_1 = require("./resolvers/companies.resolver");
const questions_resolver_1 = require("./resolvers/questions.resolver");
const learning_logs_resolver_1 = require("./resolvers/learning-logs.resolver");
const auth_module_1 = require("../auth/auth.module");
const users_module_1 = require("../users/users.module");
const companies_module_1 = require("../companies/companies.module");
const questions_module_1 = require("../questions/questions.module");
const learning_logs_module_1 = require("../learning-logs/learning-logs.module");
let GraphqlModule = class GraphqlModule {
};
exports.GraphqlModule = GraphqlModule;
exports.GraphqlModule = GraphqlModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            companies_module_1.CompaniesModule,
            questions_module_1.QuestionsModule,
            learning_logs_module_1.LearningLogsModule,
        ],
        providers: [
            auth_resolver_1.AuthResolver,
            users_resolver_1.UsersResolver,
            companies_resolver_1.CompaniesResolver,
            questions_resolver_1.QuestionsResolver,
            learning_logs_resolver_1.LearningLogsResolver,
        ],
    })
], GraphqlModule);
//# sourceMappingURL=graphql.module.js.map