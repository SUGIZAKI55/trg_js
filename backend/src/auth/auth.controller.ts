import { Controller, Request, Post, UseGuards, Body, Get } from '@nestjs/common'; // Getを追加
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard'; // ★追加: さっき作ったファイルをインポート

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  // ★追加: ここが重要！ダッシュボードがここを呼びます
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('impersonate')
  async impersonate(@Body() body: { userId: number }) {
    return this.authService.impersonate(body.userId);
  }
}