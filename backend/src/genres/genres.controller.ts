import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { GenresService } from './genres.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/genres')
@UseGuards(JwtAuthGuard)
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Get()
  findAll() {
    return this.genresService.findAll();
  }

  @Post()
  create(@Body() body: { name: string; description?: string }, @Request() req) {
    // MASTER や ADMIN のみがジャンル作成可能とする
    const role = req.user?.role?.toUpperCase();
    if (role !== 'MASTER' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      throw new Error('ジャンル作成権限がありません');
    }
    return this.genresService.create(body.name, body.description);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string },
    @Request() req,
  ) {
    // MASTER や ADMIN のみがジャンル更新可能とする
    const role = req.user?.role?.toUpperCase();
    if (role !== 'MASTER' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      throw new Error('ジャンル更新権限がありません');
    }
    return this.genresService.update(+id, body.name, body.description);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    // MASTER のみがジャンル削除可能とする
    const role = req.user?.role?.toUpperCase();
    if (role !== 'MASTER') {
      throw new Error('ジャンル削除権限がありません');
    }
    return this.genresService.remove(+id);
  }
}
