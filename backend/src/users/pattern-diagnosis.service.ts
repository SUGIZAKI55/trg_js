import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningLog } from '../entities/learning-log.entity';

export interface PatternDiagnosisResult {
  patternType: 'balanced' | 'specialist' | 'growth' | 'improvement' | 'beginner';
  score: number;  // 0-100
  genreStats: { [genre: string]: { correctRate: number; count: number } };
  genreConcentration: number;  // 0-100（高いほど特定分野に集中）
  growthRate: number;  // %（負の値は成長していない）
  recommendation: string;  // ユーザーへの推奨メッセージ
}

@Injectable()
export class PatternDiagnosisService {
  constructor(
    @InjectRepository(LearningLog)
    private learningLogRepository: Repository<LearningLog>,
  ) {}

  /**
   * ユーザーの学習パターンを診断
   */
  async diagnosePattern(userId: number): Promise<PatternDiagnosisResult> {
    // 1. ユーザーの全学習ログを取得
    const logs = await this.learningLogRepository.find({
      where: { user: { id: userId } },
      relations: ['question'],
      order: { learned_at: 'ASC' }  // 古い順にソート
    });

    // 2. ログ数チェック
    if (logs.length < 5) {
      return this.createBeginnerDiagnosis();
    }

    // 3. ジャンル別統計を計算
    const genreStats = this.calculateGenreStats(logs);

    // 4. パターン判定
    let patternType: PatternDiagnosisResult['patternType'];
    let score: number;
    let genreConcentration: number;
    let growthRate: number;
    let recommendation: string;

    const overallCorrectRate = this.calculateOverallCorrectRate(logs);
    const genreArray = Object.entries(genreStats);
    const correctRates = genreArray.map(([_, stats]) => stats.correctRate);

    // パターン判定（優先度順）
    // 1. バランス型チェック
    if (this.isBalanced(correctRates)) {
      patternType = 'balanced';
      score = Math.min(100, overallCorrectRate);
      genreConcentration = this.calculateConcentration(correctRates);
      growthRate = this.calculateGrowthRate(logs);
      recommendation = '「バランス型」すべてのジャンルで満遍なく学習しており、幅広い知識が備わっています。';
    }
    // 2. 専門特化型チェック
    else if (this.isSpecialist(correctRates)) {
      patternType = 'specialist';
      score = Math.min(100, Math.max(...correctRates));
      genreConcentration = this.calculateConcentration(correctRates);
      growthRate = this.calculateGrowthRate(logs);
      recommendation = '「専門特化型」得意なジャンルに集中して学習しています。得意分野をさらに深掘りしても良いでしょう。';
    }
    // 3. 成長型チェック
    else if (this.isGrowth(logs)) {
      patternType = 'growth';
      score = Math.min(100, overallCorrectRate * 1.2);  // 成長していることをボーナス
      genreConcentration = this.calculateConcentration(correctRates);
      growthRate = this.calculateGrowthRate(logs);
      recommendation = '「成長型」学習を進めるにつれて確実に成績が上がっています。この調子で頑張りましょう！';
    }
    // 4. 改善型チェック
    else if (this.isImproving(logs)) {
      patternType = 'improvement';
      score = overallCorrectRate * 0.8 + 10;  // 改善傾向をボーナス
      genreConcentration = this.calculateConcentration(correctRates);
      growthRate = this.calculateGrowthRate(logs);
      recommendation = '「改善型」まだ成績は高くありませんが、着実に改善しています。継続が大事です。';
    }
    // 5. その他
    else {
      patternType = 'beginner';
      score = overallCorrectRate;
      genreConcentration = this.calculateConcentration(correctRates);
      growthRate = this.calculateGrowthRate(logs);
      recommendation = '「初級者」学習をもっと進めることで、より詳しい診断が可能になります。';
    }

    return {
      patternType,
      score: Math.round(score),
      genreStats,
      genreConcentration: Math.round(genreConcentration),
      growthRate: Math.round(growthRate * 100) / 100,
      recommendation
    };
  }

  /**
   * ジャンル別統計を計算
   */
  private calculateGenreStats(logs: LearningLog[]): { [genre: string]: { correctRate: number; count: number } } {
    const stats: { [genre: string]: { correct: number; total: number } } = {};

    logs.forEach(log => {
      const genre = log.question?.genre || 'Unknown';
      if (!stats[genre]) {
        stats[genre] = { correct: 0, total: 0 };
      }
      stats[genre].total++;
      if (log.is_correct) {
        stats[genre].correct++;
      }
    });

    // パーセンテージに変換
    const result: { [genre: string]: { correctRate: number; count: number } } = {};
    Object.entries(stats).forEach(([genre, data]) => {
      result[genre] = {
        correctRate: (data.correct / data.total) * 100,
        count: data.total
      };
    });

    return result;
  }

  /**
   * 全体的な正答率を計算
   */
  private calculateOverallCorrectRate(logs: LearningLog[]): number {
    if (logs.length === 0) return 0;
    const correct = logs.filter(log => log.is_correct).length;
    return (correct / logs.length) * 100;
  }

  /**
   * バランス型判定
   * 複数ジャンルで均等に成績が良い場合
   */
  private isBalanced(correctRates: number[]): boolean {
    if (correctRates.length < 2) return false;

    const avgRate = correctRates.reduce((a, b) => a + b, 0) / correctRates.length;
    const allAbove70 = correctRates.every(rate => rate >= 70);
    const variance = this.calculateVariance(correctRates);

    // 全ジャンル70%以上 かつ ばらつきが小さい
    return allAbove70 && variance <= 15;
  }

  /**
   * 専門特化型判定
   * 得意ジャンルと弱点ジャンルの差が大きい場合
   */
  private isSpecialist(correctRates: number[]): boolean {
    if (correctRates.length < 2) return false;

    const maxRate = Math.max(...correctRates);
    const minRate = Math.min(...correctRates);
    const difference = maxRate - minRate;

    // 得意分野と弱点が30%以上異なる かつ 得意分野は70%以上
    return difference >= 30 && maxRate >= 70;
  }

  /**
   * 成長型判定
   * 学習ログの時系列で正答率が上昇傾向の場合
   */
  private isGrowth(logs: LearningLog[]): boolean {
    const midpoint = Math.floor(logs.length / 2);
    const firstHalf = logs.slice(0, midpoint);
    const secondHalf = logs.slice(midpoint);

    if (firstHalf.length === 0 || secondHalf.length === 0) return false;

    const firstHalfRate = this.calculateCorrectRate(firstHalf);
    const secondHalfRate = this.calculateCorrectRate(secondHalf);

    const growthRate = ((secondHalfRate - firstHalfRate) / firstHalfRate) * 100;

    // 成長率20%以上 かつ 後半の正答率が60%以上
    return growthRate >= 20 && secondHalfRate >= 60;
  }

  /**
   * 改善型判定
   * 成績は低いが改善傾向の場合
   */
  private isImproving(logs: LearningLog[]): boolean {
    const overallRate = this.calculateOverallCorrectRate(logs);
    const growthRate = this.calculateGrowthRate(logs);

    // 全体正答率60%未満 かつ 成長率10%以上
    return overallRate < 60 && growthRate > 10;
  }

  /**
   * ジャンル集中度を計算（0-100）
   * 高いほど特定分野に集中している
   */
  private calculateConcentration(correctRates: number[]): number {
    if (correctRates.length < 2) return 0;

    const maxRate = Math.max(...correctRates);
    const minRate = Math.min(...correctRates);

    // 差分を集中度として返す (0-100)
    return Math.min(100, maxRate - minRate);
  }

  /**
   * 成長率を計算（%）
   */
  private calculateGrowthRate(logs: LearningLog[]): number {
    const midpoint = Math.floor(logs.length / 2);
    const firstHalf = logs.slice(0, midpoint);
    const secondHalf = logs.slice(midpoint);

    if (firstHalf.length === 0) return 0;

    const firstHalfRate = this.calculateCorrectRate(firstHalf);
    const secondHalfRate = this.calculateCorrectRate(secondHalf);

    if (firstHalfRate === 0) return 0;

    return ((secondHalfRate - firstHalfRate) / firstHalfRate) * 100;
  }

  /**
   * 正答率を計算（0-100）
   */
  private calculateCorrectRate(logs: LearningLog[]): number {
    if (logs.length === 0) return 0;
    const correct = logs.filter(log => log.is_correct).length;
    return (correct / logs.length) * 100;
  }

  /**
   * 分散を計算（ばらつき度）
   */
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;

    return Math.sqrt(variance);  // 標準偏差を返す
  }

  /**
   * 初級者診断結果を作成
   */
  private createBeginnerDiagnosis(): PatternDiagnosisResult {
    return {
      patternType: 'beginner',
      score: 0,
      genreStats: {},
      genreConcentration: 0,
      growthRate: 0,
      recommendation: '「初級者」学習をもっと進めることで、より詳しい診断が可能になります。'
    };
  }
}
