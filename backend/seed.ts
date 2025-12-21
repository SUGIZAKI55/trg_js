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

  // 1. 会社・部署・ユーザー作成 (変更なし)
  let masterComp = new Company(); masterComp.name = "SugiTech Master"; masterComp = await companyRepo.save(masterComp);
  let clientA = new Company(); clientA.name = "Client Corp A"; clientA = await companyRepo.save(clientA);
  let deptSales = new Department(); deptSales.name = "営業部"; deptSales.company = clientA; deptSales = await deptRepo.save(deptSales);
  let section1 = new Section(); section1.name = "営業一課"; section1.department = deptSales; section1 = await sectionRepo.save(section1);

  const hash = await bcrypt.hash('admin123', 10);

  const masterUser = new User(); masterUser.username = "master"; masterUser.password = hash; masterUser.role = "MASTER"; masterUser.company = masterComp; await userRepo.save(masterUser);
  const superAdmin = new User(); superAdmin.username = "superadmin_a"; superAdmin.password = hash; superAdmin.role = "SUPER_ADMIN"; superAdmin.company = clientA; await userRepo.save(superAdmin);
  const deptAdmin = new User(); deptAdmin.username = "manager_sales"; deptAdmin.password = hash; deptAdmin.role = "ADMIN"; deptAdmin.company = clientA; deptAdmin.department = deptSales; await userRepo.save(deptAdmin);
  const staff = new User(); staff.username = "staff_01"; staff.password = hash; staff.role = "USER"; staff.company = clientA; staff.department = deptSales; staff.section = section1; await userRepo.save(staff);

  // --- 問題データ (ここを更新) ---
  const q1 = new Question();
  q1.type = "SINGLE"; // 単一選択
  q1.genre = "Business";
  q1.title = "名刺交換で適切なのは？";
  // 選択肢だけを保存
  q1.choices = "A:相手より低く出す|B:投げて渡す|C:折り曲げる|D:受け取らない";
  q1.answer = "A"; // 正解は記号のみ保存
  q1.company = clientA; 
  await questionRepo.save(q1);

  // 複数選択のサンプル
  const q2 = new Question();
  q2.type = "MULTIPLE"; // 複数選択
  q2.genre = "IT";
  q2.title = "安全なパスワードの特徴をすべて選べ";
  q2.choices = "A:8文字以上|B:誕生日を使う|C:記号を含む|D:名前そのままである";
  q2.answer = "A,C"; // AとCが正解
  q2.company = clientA;
  await questionRepo.save(q2);

  console.log('Seeding completed!');
  await app.close();
}
bootstrap();