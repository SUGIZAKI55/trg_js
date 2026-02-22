import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// ルート機能
import { AppController } from './app.controller';
import { AppService } from './app.service';

// 各機能モジュール
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { QuestionsModule } from './questions/questions.module';
import { LearningLogsModule } from './learning-logs/learning-logs.module';

// データベースの設計図（Entities）
import { User } from './entities/user.entity';
import { Company } from './entities/company.entity';
import { Department } from './entities/department.entity';
import { Section } from './entities/section.entity';
import { Course } from './entities/course.entity';
import { Question } from './entities/question.entity';
import { LearningLog } from './entities/learning-log.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'sugizaki_v2.db',
      entities: [
        User,
        Company,
        Department,
        Section,
        Course,
        Question,
        LearningLog
      ],
      // 開発環境では true にしておくと、Entityの変更がDBに自動反映されます
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    CompaniesModule,
    QuestionsModule,
    LearningLogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}