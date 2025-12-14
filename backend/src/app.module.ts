import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module'; // ★追加

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
      entities: [User, Company, Department, Section, Course, Question, LearningLog],
      synchronize: true,
    }),
    AuthModule,
    UsersModule, // ★ここに追加
  ],
})
export class AppModule {}