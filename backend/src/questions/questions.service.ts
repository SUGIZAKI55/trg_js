import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Question } from '../entities/question.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

  /**
   * ★追加: ユーザーがアクセス可能なジャンルを重複なく取得する
   */
  async getGenres(currentUser: any): Promise<string[]> {
    const questions = await this.questionRepository.find({
      where: [
        { companyId: currentUser.companyId }, // 自社の問題
        { companyId: IsNull() }               // 共通ライブラリ
      ],
      select: ['genre'],
    });

    const genres = questions.map((q) => q.genre);
    // Setを使って重複を削除し、空文字を除去して返す
    return Array.from(new Set(genres)).filter((g) => !!g);
  }

  /**
   * ★追加: 指定されたジャンルと問題数に基づいて問題をランダム（または先頭から）取得する
   */
  async getQuizQuestions(genre: string, count: number, currentUser: any): Promise<Question[]> {
    return this.questionRepository.find({
      where: [
        { genre, companyId: currentUser.companyId },
        { genre, companyId: IsNull() }
      ],
      take: count, // 指定された数だけ取得
    });
  }

  /**
   * 問題一覧の取得（管理用）
   */
  async findAll(currentUser: any): Promise<Question[]> {
    const role = currentUser.role?.toUpperCase();
    if (role === 'MASTER') {
      return this.questionRepository.find({ relations: ['company'] });
    }
    return this.questionRepository.find({
      where: [
        { companyId: currentUser.companyId },
        { companyId: IsNull() }
      ],
      relations: ['company'],
    });
  }

  /**
   * 共通ライブラリのみ取得
   */
  async findCommon(): Promise<Question[]> {
    return this.questionRepository.find({ where: { companyId: IsNull() } });
  }

  /**
   * 更新ロジック
   */
  async update(id: number, updateData: any, currentUser: any): Promise<Question> {
    const question = await this.questionRepository.findOne({ where: { id } });
    if (!question) throw new NotFoundException('問題が見つかりません');

    const isMaster = currentUser.role?.toUpperCase() === 'MASTER';
    if (!isMaster && question.companyId !== currentUser.companyId) {
      throw new ForbiddenException('編集権限がありません');
    }

    const { id: _, company, ...validData } = updateData;
    Object.assign(question, validData);
    return this.questionRepository.save(question);
  }

  /**
   * コピー機能（共通ライブラリ -> 自社）
   */
  async copyToCompany(questionId: number, currentUser: any): Promise<Question> {
    const source = await this.questionRepository.findOne({ where: { id: questionId } });
    if (!source) throw new NotFoundException('コピー元が見つかりません');

    const newQuestion = this.questionRepository.create({
      ...source,
      id: undefined, // 新規作成
      companyId: currentUser.companyId, // 自社IDを付与
    });

    return this.questionRepository.save(newQuestion);
  }

  /**
   * 削除
   */
  async remove(id: number, currentUser: any): Promise<void> {
    const question = await this.questionRepository.findOne({ where: { id } });
    if (!question) throw new NotFoundException('問題が見つかりません');
    if (currentUser.role?.toUpperCase() !== 'MASTER' && question.companyId !== currentUser.companyId) {
      throw new ForbiddenException('削除権限がありません');
    }
    await this.questionRepository.remove(question);
  }

  /**
   * ★追加: 一括削除
   */
  async batchDelete(questionIds: number[], currentUser: any): Promise<{ deleted: number; message: string }> {
    if (!questionIds || questionIds.length === 0) {
      throw new Error('削除対象の問題IDが指定されていません');
    }

    // 権限チェック：各問題が削除可能か確認
    const questions = await this.questionRepository.find({
      where: { id: undefined }, // これだと動作しないので IN() を使う
    });

    // TypeORM では IN() クエリ
    const targetQuestions = await this.questionRepository
      .createQueryBuilder('q')
      .where('q.id IN (:...ids)', { ids: questionIds })
      .getMany();

    if (targetQuestions.length === 0) {
      throw new NotFoundException('指定された問題が見つかりません');
    }

    // 権限チェック
    const isMaster = currentUser.role?.toUpperCase() === 'MASTER';
    for (const question of targetQuestions) {
      if (!isMaster && question.companyId !== currentUser.companyId) {
        throw new ForbiddenException('削除権限がない問題が含まれています');
      }
    }

    // 一括削除実行
    const result = await this.questionRepository.remove(targetQuestions);
    return {
      deleted: result.length,
      message: `${result.length}件の問題を削除しました`,
    };
  }

  /**
   * ★追加: CSV エクスポート
   */
  async exportCsv(genre?: string, type?: string, currentUser?: any): Promise<string> {
    let query = this.questionRepository.createQueryBuilder('q');

    // フィルタ適用
    if (genre) {
      query = query.where('q.genre = :genre', { genre });
    }

    if (type) {
      query = query.andWhere('q.type = :type', { type });
    }

    // 権限チェック：ユーザーは自社と共通ライブラリのみアクセス可能
    if (currentUser && currentUser.role?.toUpperCase() !== 'MASTER') {
      query = query.where('(q.companyId = :companyId OR q.companyId IS NULL)', {
        companyId: currentUser.companyId,
      });
    }

    const questions = await query.getMany();

    // CSV ヘッダー
    const header = ['ID', 'ジャンル', 'タイプ', '問題文', '選択肢', '正解'].join(',');

    // CSV データ行
    const rows = questions.map((q) => {
      const escapedTitle = q.title.includes(',') || q.title.includes('"') ? `"${q.title.replace(/"/g, '""')}"` : q.title;
      const escapedChoices = q.choices.includes(',') || q.choices.includes('"') ? `"${q.choices.replace(/"/g, '""')}"` : q.choices;
      return [q.id, q.genre, q.type, escapedTitle, escapedChoices, q.answer].join(',');
    });

    return [header, ...rows].join('\n');
  }

  /**
   * ★追加: 問題複製
   */
  async duplicate(questionId: number, currentUser: any, newTitle?: string): Promise<Question> {
    const source = await this.questionRepository.findOne({ where: { id: questionId } });
    if (!source) throw new NotFoundException('複製元の問題が見つかりません');

    // 権限チェック
    const isMaster = currentUser.role?.toUpperCase() === 'MASTER';
    if (!isMaster && source.companyId !== currentUser.companyId && source.companyId !== null) {
      throw new ForbiddenException('複製権限がありません');
    }

    // 新しい問題を作成
    const duplicated = this.questionRepository.create({
      ...source,
      id: undefined, // 新規作成
      title: newTitle || `${source.title}(コピー)`,
      companyId: currentUser.companyId, // 自社IDを付与
    });

    return this.questionRepository.save(duplicated);
  }
}