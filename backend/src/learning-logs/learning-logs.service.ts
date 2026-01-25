import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningLog } from '../entities/learning-log.entity';

@Injectable()
export class LearningLogsService {
  constructor(
    @InjectRepository(LearningLog)
    private readonly logRepository: Repository<LearningLog>,
  ) {}

  // 履歴一覧取得
  async findAll(currentUser: any): Promise<LearningLog[]> {
    return this.logRepository.find({
      where: currentUser.role !== 'MASTER' ? { user: { company: { id: currentUser.companyId } } } : {},
      relations: ['user', 'question'],
      order: { learned_at: 'DESC' }
    });
  }

  // ★一括保存メソッド
  async createLogs(currentUser: any, results: { questionId: number, isCorrect: boolean }[]) {
    const userId = currentUser.userId || currentUser.id;

    const logEntities = results.map((res) => {
      return this.logRepository.create({
        is_correct: res.isCorrect,
        learned_at: new Date(),
        user: { id: userId } as any,
        question: { id: res.questionId } as any,
      });
    });

    return await this.logRepository.save(logEntities);
  }
}