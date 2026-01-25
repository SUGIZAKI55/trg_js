"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningLogsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const learning_logs_service_1 = require("./learning-logs.service");
const learning_logs_controller_1 = require("./learning-logs.controller");
const learning_log_entity_1 = require("../entities/learning-log.entity");
const question_entity_1 = require("../entities/question.entity");
let LearningLogsModule = class LearningLogsModule {
};
exports.LearningLogsModule = LearningLogsModule;
exports.LearningLogsModule = LearningLogsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([learning_log_entity_1.LearningLog, question_entity_1.Question])
        ],
        controllers: [learning_logs_controller_1.LearningLogsController],
        providers: [learning_logs_service_1.LearningLogsService],
    })
], LearningLogsModule);
//# sourceMappingURL=learning-logs.module.js.map