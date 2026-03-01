import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ダッシュボード用データ
  @UseGuards(JwtAuthGuard)
  @Get('dashboard_data')
  getDashboardData(@Request() req) {
    return {
      username: req.user.username,
      review_count: 5,
      genre_stats: {
        'Business': 80,
        'IT': 65,
        'Compliance': 90
      }
    };
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // ユーザー一覧取得
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    return this.usersService.findAll(req.user);
  }

  // 学習パターン診断関連エンドポイント
  // ★重要: より詳細なルート（pattern-diagnosis）を先に定義してから汎用ルート（:id）を定義

  /**
   * 学習パターン診断結果を取得（既存の診断結果がある場合）
   * GET /api/users/:id/pattern-diagnosis
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id/pattern-diagnosis')
  getPatternDiagnosis(@Param('id') id: string) {
    return this.usersService.getPatternDiagnosis(+id);
  }

  /**
   * 学習パターン診断を実行して保存
   * POST /api/users/:id/pattern-diagnosis
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/pattern-diagnosis')
  runPatternDiagnosis(@Param('id') id: string) {
    return this.usersService.diagnoseAndSavePattern(+id);
  }

  /**
   * 学習パターン診断を強制再実行
   * PATCH /api/users/:id/pattern-diagnosis/force
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/pattern-diagnosis/force')
  forcePatternDiagnosis(@Param('id') id: string) {
    return this.usersService.diagnoseAndSavePattern(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  // ★追加：ユーザー個人の分析データ取得
  @UseGuards(JwtAuthGuard)
  @Get('analysis_data')
  getAnalysisData(@Request() req) {
    return this.usersService.getAnalysisData(req.user);
  }

  // ★追加：ユーザー削除用エンドポイント
  // フロントエンドからの DELETE http://localhost:3000/api/users/:id を受け取ります
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    // URLの末尾にあるID（文字列）を数値に変換してServiceに渡します
    return this.usersService.remove(+id);
  }
}