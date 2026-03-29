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

  // ★分析用データ取得メソッド（管理者向け）
  async getAnalysisData(currentUser: any): Promise<any[]> {
    const logs = await this.logRepository.find({
      where: currentUser.role !== 'MASTER' ? { user: { company: { id: currentUser.companyId } } } : {},
      relations: ['user', 'user.company', 'question'],
      order: { learned_at: 'DESC' }
    });

    // データをフォーマットして返す
    return logs.map((log) => ({
      timestamp: log.learned_at.toISOString(),
      question_title: log.question?.title || '',
      is_correct: log.is_correct,
      elapsed_time: null, // 現在エンティティに elapsed_time フィールドがないため null
      genre: log.question?.genre || '',
      user: {
        id: log.user?.id,
        username: log.user?.username,
        company: log.user?.company
      },
      question_id: log.question?.id
    }));
  }
}