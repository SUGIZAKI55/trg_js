import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningLogsService } from './learning-logs.service';
import { LearningLogsController } from './learning-logs.controller';
import { LearningLog } from '../entities/learning-log.entity';
import { Question } from '../entities/question.entity'; // 追加

@Module({
  imports: [
    // Questionを登録しないとServiceでRepositoryエラーになります
    TypeOrmModule.forFeature([LearningLog, Question]) 
  ],
  controllers: [LearningLogsController],
  providers: [LearningLogsService],
})
export class LearningLogsModule {}