import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningLog } from '../entities/learning-log.entity';

export interface QuizLogEntry {
  date: string;
  name: string;
  genre: string;
  question_id: number;
  question_title: string;
  user_choice: string[];
  correct_answers: string[];
  result: string;
  kaisetsu: string;
  start_time: string | null;
  end_time: string;
  elapsed_time: number | null;
}

export interface RolePermission {
  role: string;
  displayName: string;
  icon: string;
  description: string;
  features: {
    name: string;
    accessible: boolean;
    description: string;
  }[];
  actions: string[];
}

export interface RoleFlowData {
  roles: RolePermission[];
  flow: {
    step: number;
    title: string;
    options: {
      role: string;
      access: string;
      features: string[];
    }[];
  };
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(LearningLog)
    private readonly logRepository: Repository<LearningLog>,
  ) {}

  /**
   * 全ログを取得して LogViewer 用にフォーマット
   */
  async getAllLogs(currentUser: any): Promise<QuizLogEntry[]> {
    // MASTER権限の場合は全データ、それ以外は同じ会社のデータのみ
    const logs = await this.logRepository.find({
      where: currentUser.role !== 'MASTER' ? { user: { company: { id: currentUser.companyId } } } : {},
      relations: ['user', 'user.company', 'question'],
      order: { learned_at: 'DESC' }
    });

    // LogViewer が期待する形式にフォーマット
    return logs.map((log) => ({
      date: log.learned_at.toLocaleDateString('ja-JP'),
      name: log.user?.username || '',
      genre: log.question?.genre || '',
      question_id: log.question?.id || 0,
      question_title: log.question?.title || '',
      user_choice: [], // 現在のスキーマにはユーザーの選択肢を保存していないため空配列
      correct_answers: log.question?.answer ? [log.question.answer] : [],
      result: log.is_correct ? '正解' : '不正解',
      kaisetsu: '', // 解説は現在保存されていないため空
      start_time: null, // 現在スキーマに開始時刻がないため null
      end_time: log.learned_at.toLocaleTimeString('ja-JP'),
      elapsed_time: null, // 現在スキーマに経過時間がないため null
    }));
  }

  /**
   * ロール権限情報を取得（ロール判定フロー用）
   */
  getRolePermissions(): RoleFlowData {
    const roles: RolePermission[] = [
      {
        role: 'MASTER',
        displayName: 'マスター管理者',
        icon: '👑',
        description: '最高権限。全システム機能にアクセス可能',
        features: [
          { name: 'ユーザー管理', accessible: true, description: '全ユーザーの作成・編集・削除' },
          { name: '会社管理', accessible: true, description: '全会社の管理' },
          { name: '問題管理', accessible: true, description: '全問題の作成・編集・削除' },
          { name: 'ログ閲覧', accessible: true, description: '全ユーザーのログ閲覧' },
          { name: '分析', accessible: true, description: '全システム分析' },
          { name: 'セキュリティ設定', accessible: true, description: 'システムセキュリティ設定' },
        ],
        actions: [
          'ユーザー作成・編集・削除',
          '会社作成・編集',
          '問題作成・編集・削除',
          'ログ全閲覧',
          '学習分析（全ユーザー）',
          'システム設定変更',
          '権限管理',
        ],
      },
      {
        role: 'ADMIN',
        displayName: '管理者',
        icon: '🔐',
        description: '会社内の管理権限。同じ会社のデータのみ管理可能',
        features: [
          { name: 'ユーザー管理', accessible: true, description: '同じ会社のユーザーのみ作成・編集・削除' },
          { name: '会社管理', accessible: false, description: '会社管理は不可' },
          { name: '問題管理', accessible: true, description: '同じ会社の問題のみ作成・編集・削除' },
          { name: 'ログ閲覧', accessible: true, description: '同じ会社のログのみ閲覧' },
          { name: '分析', accessible: true, description: '同じ会社の分析のみ可能' },
          { name: 'セキュリティ設定', accessible: false, description: 'セキュリティ設定は不可' },
        ],
        actions: [
          'ユーザー作成・編集・削除（同社のみ）',
          '問題作成・編集・削除（同社のみ）',
          'ログ閲覧（同社のみ）',
          '学習分析（同社のみ）',
          'スタッフ管理',
        ],
      },
      {
        role: 'USER',
        displayName: 'ユーザー',
        icon: '👤',
        description: '一般ユーザー。自分の学習データのみアクセス可能',
        features: [
          { name: 'ユーザー管理', accessible: false, description: 'ユーザー管理は不可' },
          { name: '会社管理', accessible: false, description: '会社管理は不可' },
          { name: '問題管理', accessible: false, description: '問題管理は不可' },
          { name: 'ログ閲覧', accessible: true, description: '自分のログのみ閲覧' },
          { name: '分析', accessible: true, description: '自分の学習分析のみ可能' },
          { name: 'セキュリティ設定', accessible: false, description: 'セキュリティ設定は不可' },
        ],
        actions: [
          'クイズ実施',
          '自分の学習ログ閲覧',
          '自分の学習分析閲覧',
          '学習パターン診断',
          'プロフィール編集',
        ],
      },
    ];

    return {
      roles,
      flow: {
        step: 1,
        title: 'ユーザーログイン',
        options: [
          {
            role: 'MASTER',
            access: '全機能アクセス可',
            features: ['全ユーザー管理', '会社管理', '問題管理', '全ログ閲覧', '全体分析'],
          },
          {
            role: 'ADMIN',
            access: '管理機能アクセス可',
            features: ['同社ユーザー管理', '問題管理', '同社ログ閲覧', '同社分析'],
          },
          {
            role: 'USER',
            access: '個人機能のみアクセス可',
            features: ['自分のログ閲覧', '自分の分析', 'クイズ実施'],
          },
        ],
      },
    };
  }
}
