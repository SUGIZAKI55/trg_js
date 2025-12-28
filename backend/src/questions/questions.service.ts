import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
  ) {}

  // 1. 通常作成
  async create(createQuestionDto: CreateQuestionDto, user: any) {
    const newQuestion = this.questionRepo.create({
      ...createQuestionDto,
      company: { id: user.companyId }
    });
    return this.questionRepo.save(newQuestion);
  }

  // 2. CSV一括登録 (Master専用)
  async createFromCsv(fileBuffer: Buffer) {
    // バッファを文字列に変換
    const csvContent = fileBuffer.toString('utf-8');
    // 行ごとに分割 (Windowsの\r\nとMac/Linuxの\n両方に対応)
    const lines = csvContent.split(/\r?\n/);

    const savedQuestions = [];

    // ★追加: 余計なクオーテーション(")と空白を取り除く便利関数
    const clean = (text: string) => {
        if (!text) return '';
        // trim()で空白削除 -> replaceで先頭(^")と末尾("$)のダブルクォートを削除
        return text.trim().replace(/^"|"$/g, '');
    };

    for (const line of lines) {
      if (!line.trim()) continue; // 空行はスキップ

      // カンマで分割
      const cols = line.split(',');

      // 列数が足りない場合はスキップ(あるいはエラー)
      if (cols.length < 8) continue;

      // ★修正: clean() を通してデータを取り出す
      const genre = clean(cols[0]);
      const type = clean(cols[1]).toUpperCase(); // 大文字に統一
      const title = clean(cols[2]);
      
      // 選択肢を結合 (A:xxx|B:yyy...)
      const choices = `A:${clean(cols[3])}|B:${clean(cols[4])}|C:${clean(cols[5])}|D:${clean(cols[6])}`;
      
      const answer = clean(cols[7]);

      // companyをセットせずに保存 (=全社共通)
      const newQuestion = this.questionRepo.create({
        genre,
        type,
        title,
        choices,
        answer,
        company: null // ★重要：共通問題とする
      });

      savedQuestions.push(await this.questionRepo.save(newQuestion));
    }

    return { count: savedQuestions.length, message: 'CSV import successful' };
  }

  // 3. 自分の会社の問題一覧
  async findAll(user: any) {
    if (user.role === 'MASTER') {
      // マスターは全データ (共通 + 各社)
      return this.questionRepo.find({ relations: ['company'] });
    } else {
      // 企業ユーザーは「自分の会社」のデータのみ
      return this.questionRepo.find({
        where: { company: { id: user.companyId } },
        relations: ['company']
      });
    }
  }

  // 4. 共通問題(ライブラリ)一覧を取得
  async findCommon() {
    return this.questionRepo.find({
      where: { company: null }, // companyが空のものが共通問題
    });
  }

  // 5. コピー機能 (共通問題を自社に取り込む)
  async copyToCompany(questionId: number, user: any) {
    // 元の問題を探す
    const original = await this.questionRepo.findOne({ 
        where: { id: questionId },
        relations: ['company']
    });

    if (!original) {
      throw new BadRequestException('問題が見つかりません');
    }

    // 新しい問題として作成
    const copy = this.questionRepo.create({
      genre: original.genre,
      type: original.type,
      title: original.title,
      choices: original.choices,
      answer: original.answer,
      company: { id: user.companyId } // ★ここを実行者の会社にする
    });

    return this.questionRepo.save(copy);
  }

  async remove(id: number) {
    return this.questionRepo.delete(id);
  }
}