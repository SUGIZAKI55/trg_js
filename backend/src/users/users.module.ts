import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PatternDiagnosisService } from './pattern-diagnosis.service';
import { User } from '../entities/user.entity';
import { LearningLog } from '../entities/learning-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, LearningLog])],
  providers: [UsersService, PatternDiagnosisService],
  controllers: [UsersController],
  // ★重要: これがないと他のモジュール(Auth)から使えません！
  exports: [UsersService],
})
export class UsersModule {}