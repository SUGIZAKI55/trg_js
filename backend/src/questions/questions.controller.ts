import { Controller, Get, Post, Body, UseGuards, Request, Delete, Param } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/questions')
@UseGuards(JwtAuthGuard) // ログイン必須にする
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  create(@Body() createQuestionDto: CreateQuestionDto, @Request() req) {
    // req.user（ログイン中の人の情報）をServiceに渡す
    return this.questionsService.create(createQuestionDto, req.user);
  }

  @Get()
  findAll(@Request() req) {
    // ここでも req.user を渡してフィルタリングしてもらう
    return this.questionsService.findAll(req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionsService.remove(+id);
  }
}