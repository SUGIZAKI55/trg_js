"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const companies_module_1 = require("./companies/companies.module");
const questions_module_1 = require("./questions/questions.module");
const learning_logs_module_1 = require("./learning-logs/learning-logs.module");
const user_entity_1 = require("./entities/user.entity");
const company_entity_1 = require("./entities/company.entity");
const department_entity_1 = require("./entities/department.entity");
const section_entity_1 = require("./entities/section.entity");
const course_entity_1 = require("./entities/course.entity");
const question_entity_1 = require("./entities/question.entity");
const learning_log_entity_1 = require("./entities/learning-log.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'sqlite',
                database: 'sugizaki_v2.db',
                entities: [
                    user_entity_1.User,
                    company_entity_1.Company,
                    department_entity_1.Department,
                    section_entity_1.Section,
                    course_entity_1.Course,
                    question_entity_1.Question,
                    learning_log_entity_1.LearningLog
                ],
                synchronize: true,
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            companies_module_1.CompaniesModule,
            questions_module_1.QuestionsModule,
            learning_logs_module_1.LearningLogsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map