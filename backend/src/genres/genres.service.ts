import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Genre } from '../entities/genre.entity';
import { Question } from '../entities/question.entity';

@Injectable()
export class GenresService {
  constructor(
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

  /**
   * ジャンル一覧取得
   */
  async findAll(): Promise<Genre[]> {
    return this.genreRepository.find({ order: { name: 'ASC' } });
  }

  /**
   * ジャンル作成
   */
  async create(name: string, description?: string): Promise<Genre> {
    if (!name || name.trim() === '') {
      throw new BadRequestException('ジャンル名は必須です');
    }

    const existing = await this.genreRepository.findOne({ where: { name } });
    if (existing) {
      throw new BadRequestException('このジャンルは既に存在します');
    }

    const genre = this.genreRepository.create({ name, description });
    return this.genreRepository.save(genre);
  }

  /**
   * ジャンル更新
   */
  async update(id: number, name?: string, description?: string): Promise<Genre> {
    const genre = await this.genreRepository.findOne({ where: { id } });
    if (!genre) throw new NotFoundException('ジャンルが見つかりません');

    if (name) genre.name = name;
    if (description !== undefined) genre.description = description;

    return this.genreRepository.save(genre);
  }

  /**
   * ジャンル削除
   */
  async remove(id: number): Promise<void> {
    const genre = await this.genreRepository.findOne({ where: { id } });
    if (!genre) throw new NotFoundException('ジャンルが見つかりません');

    // 使用中のジャンルは削除禁止
    const usageCount = await this.questionRepository.count({
      where: { genre: genre.name },
    });

    if (usageCount > 0) {
      throw new BadRequestException(`このジャンルは${usageCount}個の問題で使用されているため削除できません`);
    }

    await this.genreRepository.remove(genre);
  }
}
