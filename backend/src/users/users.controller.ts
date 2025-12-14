import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // ★追加

@Controller('api/users') // ← ここが "users" (複数形) であることを確認
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ★追加: ダッシュボード用のデータを返すAPI
  @UseGuards(JwtAuthGuard)
  @Get('dashboard_data')
  getDashboardData(@Request() req) {
    // 本来はデータベースから集計しますが、まずは表示確認用にダミーデータを返します
    return {
      username: req.user.username,
      review_count: 5, // 未復習の数（仮）
      genre_stats: {   // レーダーチャート用データ（仮）
        'JavaScript': 80,
        'React': 65,
        'NestJS': 40,
        'TypeScript': 90,
        'CSS': 55
      }
    };
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
}