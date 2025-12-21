import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ダッシュボード用データ（前回追加したもの）
  @UseGuards(JwtAuthGuard)
  @Get('dashboard_data')
  getDashboardData(@Request() req) {
    // 簡易的なダミーデータを返します（後で本格実装可）
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

  // ★修正: ユーザー一覧取得時に、誰がアクセスしたか(req.user)を渡す
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    // req.user には companyId や role が入っています
    return this.usersService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
}