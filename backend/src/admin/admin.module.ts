import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { LearningLog } from '../entities/learning-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LearningLog])],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
