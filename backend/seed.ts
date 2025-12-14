import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { Company } from './src/entities/company.entity';
import { Department } from './src/entities/department.entity';
import { Section } from './src/entities/section.entity';
import { User } from './src/entities/user.entity';
import { Question } from './src/entities/question.entity';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  
  console.log('Seeding started...');

  const companyRepo = dataSource.getRepository(Company);
  const deptRepo = dataSource.getRepository(Department);
  const sectionRepo = dataSource.getRepository(Section);
  const userRepo = dataSource.getRepository(User);
  const questionRepo = dataSource.getRepository(Question);

  // 1. マスター企業 (サービス提供元)
  let masterComp = new Company();
  masterComp.name = "SugiTech Master";
  masterComp = await companyRepo.save(masterComp);

  // 2. クライアント企業A
  let clientA = new Company();
  clientA.name = "Client Corp A";
  clientA = await companyRepo.save(clientA);

  // 3. 部署作成 (営業部)
  let deptSales = new Department();
  deptSales.name = "営業部";
  deptSales.company = clientA;
  deptSales = await deptRepo.save(deptSales);

  // 4. 課作成 (営業一課)
  let section1 = new Section();
  section1.name = "営業一課";
  section1.department = deptSales;
  section1 = await sectionRepo.save(section1);

  // --- ユーザー作成 (Passは全部 'admin123') ---
  const hash = await bcrypt.hash('admin123', 10);

  // Master User
  const masterUser = new User();
  masterUser.username = "master";
  masterUser.password_hash = hash;
  masterUser.role = "MASTER";
  masterUser.company = masterComp;
  await userRepo.save(masterUser);

  // Super Admin (企業管理者)
  const superAdmin = new User();
  superAdmin.username = "superadmin_a";
  superAdmin.password_hash = hash;
  superAdmin.role = "SUPER_ADMIN";
  superAdmin.company = clientA;
  await userRepo.save(superAdmin);

  // Admin (部長)
  const deptAdmin = new User();
  deptAdmin.username = "manager_sales";
  deptAdmin.password_hash = hash;
  deptAdmin.role = "ADMIN";
  deptAdmin.company = clientA;
  deptAdmin.department = deptSales;
  await userRepo.save(deptAdmin);

  // User (一般社員 - 課所属)
  const staff = new User();
  staff.username = "staff_01";
  staff.password_hash = hash;
  staff.role = "USER";
  staff.company = clientA;
  staff.department = deptSales;
  staff.section = section1;
  await userRepo.save(staff);

  // --- 問題データ (ダミー) ---
  const q1 = new Question();
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