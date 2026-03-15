import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Genre } from '../entities/genre.entity';
import { Question } from '../entities/question.entity';
import { GenresService } from './genres.service';
import { GenresController } from './genres.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Genre, Question])],
  providers: [GenresService],
  controllers: [GenresController],
})
export class GenresModule {}
