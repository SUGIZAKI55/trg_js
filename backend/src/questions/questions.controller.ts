import { Controller, Get, Patch, Post, Param, Body, UseGuards, Request, Delete, Query } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/questions')
@UseGuards(JwtAuthGuard)
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  // ★追加: ジャンル一覧を取得 (ユーザーがアクセス可能な全問題から抽出)
  @Get('genres')
  getGenres(@Request() req) {
    return this.questionsService.getGenres(req.user);
  }

  // ★追加: クイズ開始用の問題を抽出
  @Get('quiz-start')
  getQuizStart(@Query('genre') genre: string, @Query('count') count: string, @Request() req) {
    return this.questionsService.getQuizQuestions(genre, parseInt(count), req.user);
  }

  @Get()
  findAll(@Request() req) {
    return this.questionsService.findAll(req.user);
  }

  @Get('common')
  findCommon() {
    return this.questionsService.findCommon();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any, @Request() req) {
    return this.questionsService.update(+id, updateData, req.user);
  }

  @Post(':id/copy')
  copy(@Param('id') id: string, @Request() req) {
    return this.questionsService.copyToCompany(+id, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.questionsService.remove(+id, req.user);
  }
}