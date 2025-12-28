import { Controller, Get, Post, Body, UseGuards, Request, Delete, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/questions')
@UseGuards(JwtAuthGuard)
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  // 通常作成
  @Post()
  create(@Body() createQuestionDto: CreateQuestionDto, @Request() req) {
    return this.questionsService.create(createQuestionDto, req.user);
  }

  // ★追加: CSVアップロード (キー名は 'file' で送信)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // ファイルを受け取る魔法
  uploadCsv(@UploadedFile() file: Express.Multer.File, @Request() req) {
    // マスター以外は禁止するロジックを入れても良い
    if (req.user.role !== 'MASTER') {
       // 必要ならエラーを返す処理など
    }
    return this.questionsService.createFromCsv(file.buffer);
  }

  // ★追加: 共通問題(ライブラリ)の取得
  @Get('common')
  findCommon() {
    return this.questionsService.findCommon();
  }

  // ★追加: コピー機能
  @Post(':id/copy')
  copyToCompany(@Param('id') id: string, @Request() req) {
    return this.questionsService.copyToCompany(+id, req.user);
  }

  // 通常の一覧取得 (自社の問題)
  @Get()
  findAll(@Request() req) {
    return this.questionsService.findAll(req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionsService.remove(+id);
  }
}