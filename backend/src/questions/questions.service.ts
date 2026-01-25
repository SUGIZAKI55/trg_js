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
}