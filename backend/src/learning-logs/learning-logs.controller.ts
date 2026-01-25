import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { LearningLogsService } from './learning-logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/learning-logs')
@UseGuards(JwtAuthGuard)
export class LearningLogsController {
  constructor(private readonly logsService: LearningLogsService) {}

  @Get()
  findAll(@Request() req) {
    return this.logsService.findAll(req.user);
  }

  @Post()
  async create(@Body() body: { results: { questionId: number, isCorrect: boolean }[] }, @Request() req) {
    // Serviceの createLogs メソッドを呼び出す
    return this.logsService.createLogs(req.user, body.results);
  }
}