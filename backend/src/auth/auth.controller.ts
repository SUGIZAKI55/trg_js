import { Controller, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() req) {
    return this.authService.login(req.username, req.password);
  }

  // マスター専用: 特定ユーザーになりすまし
  @Post('impersonate')
  async impersonate(@Body() body) {
    // ※実運用ではここでMaster権限チェックが必要
    return this.authService.impersonate(body.userId);
  }
}