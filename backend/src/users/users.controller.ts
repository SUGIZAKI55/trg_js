import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
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