import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { LearningLog } from '../entities/learning-log.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { PatternDiagnosisService, PatternDiagnosisResult } from './pattern-diagnosis.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(LearningLog)
    private learningLogRepository: Repository<LearningLog>,
    private patternDiagnosisService: PatternDiagnosisService,
  ) {}

  /**
   * ユーザー名からユーザーを検索（ログイン用）
   */
  async findOneByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ 
      where: { username },
      relations: ['company'] 
    });
  }

  /**
   * ユーザー一覧の取得（権限による制御）
   */
  async findAll(currentUser: any): Promise<User[]> {
    // デバッグログ
    console.log('--- UserList Access Debug ---');
    console.log('Current User:', currentUser);

    // ロールを大文字に統一して判定（判定漏れ防止）
    const role = currentUser.role ? String(currentUser.role).toUpperCase() : '';
    console.log('Normalized Role:', role);

    if (role === 'MASTER') {
      // MASTERは全データを取得
      return this.usersRepository.find({
        relations: ['company', 'department', 'section'],
      });
    } else {
      // それ以外は自社データのみ
      return this.usersRepository.find({
        where: { 
          company: { id: currentUser.companyId } 
        },
        relations: ['company', 'department', 'section'],
      });
    }
  }

  /**
   * IDからユーザーを一件取得
   */
  async findOne(id: number): Promise<User | undefined> {
    return this.usersRepository.findOne({ 
      where: { id },
      relations: ['company', 'department', 'section'] 
    });
  }

  /**
   * 新規ユーザー作成
   * Roleの正規化（大文字統一）とパスワードハッシュ化を行う
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password || 'password123', salt);
    
    // ★ここが重要：role を大文字に変換。未指定なら 'USER'
    const normalizedRole = createUserDto.role ? createUserDto.role.toUpperCase() : 'USER';
    
    const newUser = this.usersRepository.create({
      ...createUserDto,
      role: normalizedRole, // 正規化した値を使用
      password: hashedPassword,
    });
    
    return this.usersRepository.save(newUser);
  }

  /**
   * ユーザー個人の分析データ取得
   */
  async getAnalysisData(currentUser: any): Promise<any[]> {
    const userId = Number(currentUser.userId);

    // userId が有効な数値か確認
    if (!userId || isNaN(userId)) {
      console.error('Invalid userId:', currentUser.userId, 'currentUser:', currentUser);
      return [];
    }

    const logs = await this.learningLogRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'question'],
      order: { learned_at: 'DESC' }
    });

    return logs.map((log) => ({
      timestamp: log.learned_at.toISOString(),
      question_title: log.question?.title || '',
      is_correct: log.is_correct,
      elapsed_time: null,
      genre: log.question?.genre || '',
      user: {
        id: log.user?.id,
        username: log.user?.username,
      },
      question_id: log.question?.id
    }));
  }

  /**
   * ユーザー削除
   */
  async remove(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`ID ${id} のユーザーは見つかりません。`);
    }
    await this.usersRepository.delete(id);
  }

  /**
   * 学習パターン診断を実行して結果を保存
   */
  async diagnoseAndSavePattern(userId: number): Promise<PatternDiagnosisResult> {
    // 診断ロジックを実行
    const diagnosisResult = await this.patternDiagnosisService.diagnosePattern(userId);

    // ユーザーの診断結果フィールドを更新
    await this.usersRepository.update(userId, {
      patternType: diagnosisResult.patternType,
      patternScore: diagnosisResult.score,
      genreConcentration: diagnosisResult.genreConcentration,
      growthRate: diagnosisResult.growthRate,
      patternDiagnosedAt: new Date(),
    });

    return diagnosisResult;
  }

  /**
   * 保存済みの学習パターン診断結果を取得
   */
  async getPatternDiagnosis(userId: number): Promise<PatternDiagnosisResult | null> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user || !user.patternType) {
      return null;
    }

    // 保存済みの診断結果を返す
    return {
      patternType: user.patternType as 'balanced' | 'specialist' | 'growth' | 'improvement' | 'beginner',
      score: user.patternScore || 0,
      genreStats: {}, // 詳細は別途取得が必要な場合のみ
      genreConcentration: user.genreConcentration || 0,
      growthRate: user.growthRate || 0,
      recommendation: this.getRecommendationMessage(user.patternType),
    };
  }

  /**
   * パターンタイプに応じた推奨メッセージを取得
   */
  private getRecommendationMessage(patternType: string): string {
    const messages: { [key: string]: string } = {
      balanced: '「バランス型」すべてのジャンルで満遍なく学習しており、幅広い知識が備わっています。',
      specialist: '「専門特化型」得意なジャンルに集中して学習しています。得意分野をさらに深掘りしても良いでしょう。',
      growth: '「成長型」学習を進めるにつれて確実に成績が上がっています。この調子で頑張りましょう！',
      improvement: '「改善型」まだ成績は高くありませんが、着実に改善しています。継続が大事です。',
      beginner: '「初級者」学習をもっと進めることで、より詳しい診断が可能になります。',
    };
    return messages[patternType] || '';
  }
}