"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const company_entity_1 = require("./src/entities/company.entity");
const department_entity_1 = require("./src/entities/department.entity");
const section_entity_1 = require("./src/entities/section.entity");
const user_entity_1 = require("./src/entities/user.entity");
const question_entity_1 = require("./src/entities/question.entity");
const bcrypt = __importStar(require("bcrypt"));
const typeorm_1 = require("typeorm");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const dataSource = app.get(typeorm_1.DataSource);
    console.log('Seeding started...');
    const companyRepo = dataSource.getRepository(company_entity_1.Company);
    const deptRepo = dataSource.getRepository(department_entity_1.Department);
    const sectionRepo = dataSource.getRepository(section_entity_1.Section);
    const userRepo = dataSource.getRepository(user_entity_1.User);
    const questionRepo = dataSource.getRepository(question_entity_1.Question);
    let masterComp = new company_entity_1.Company();
    masterComp.name = "SugiTech Master";
    masterComp = await companyRepo.save(masterComp);
    let clientA = new company_entity_1.Company();
    clientA.name = "Client Corp A";
    clientA = await companyRepo.save(clientA);
    let deptSales = new department_entity_1.Department();
    deptSales.name = "営業部";
    deptSales.company = clientA;
    deptSales = await deptRepo.save(deptSales);
    let section1 = new section_entity_1.Section();
    section1.name = "営業一課";
    section1.department = deptSales;
    section1 = await sectionRepo.save(section1);
    const hash = await bcrypt.hash('admin123', 10);
    const masterUser = new user_entity_1.User();
    masterUser.username = "master";
    masterUser.password_hash = hash;
    masterUser.role = "MASTER";
    masterUser.company = masterComp;
    await userRepo.save(masterUser);
    const superAdmin = new user_entity_1.User();
    superAdmin.username = "superadmin_a";
    superAdmin.password_hash = hash;
    superAdmin.role = "SUPER_ADMIN";
    superAdmin.company = clientA;
    await userRepo.save(superAdmin);
    const deptAdmin = new user_entity_1.User();
    deptAdmin.username = "manager_sales";
    deptAdmin.password_hash = hash;
    deptAdmin.role = "ADMIN";
    deptAdmin.company = clientA;
    deptAdmin.department = deptSales;
    await userRepo.save(deptAdmin);
    const staff = new user_entity_1.User();
    staff.username = "staff_01";
    staff.password_hash = hash;
    staff.role = "USER";
    staff.company = clientA;
    staff.department = deptSales;
    staff.section = section1;
    await userRepo.save(staff);
    const q1 = new question_entity_1.Question();
    q1.genre = "Business";
    q1.title = "名刺交換で適切なのは？";
    q1.choices = "A:相手より低く出す|B:投げて渡す|C:折り曲げる";
    q1.answer = "A:相手より低く出す";
    q1.company_id = clientA.id;
    await questionRepo.save(q1);
    console.log('Seeding completed!');
    await app.close();
}
bootstrap();
//# sourceMappingURL=seed.js.map