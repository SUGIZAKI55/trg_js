import { Module } from '@nestjs/common';
import { AuthResolver } from './resolvers/auth.resolver';
import { UsersResolver } from './resolvers/users.resolver';
import { CompaniesResolver } from './resolvers/companies.resolver';
import { QuestionsResolver } from './resolvers/questions.resolver';
import { LearningLogsResolver } from './resolvers/learning-logs.resolver';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { CompaniesModule } from '../companies/companies.module';
import { QuestionsModule } from '../questions/questions.module';
import { LearningLogsModule } from '../learning-logs/learning-logs.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    CompaniesModule,
    QuestionsModule,
    LearningLogsModule,
  ],
  providers: [
    AuthResolver,
    UsersResolver,
    CompaniesResolver,
    QuestionsResolver,
    LearningLogsResolver,
  ],
})
export class GraphqlModule {}
