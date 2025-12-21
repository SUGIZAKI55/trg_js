import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
  ) {}

  // 問題作成：ログインユーザーの会社IDを自動で紐付ける
  async create(createQuestionDto: CreateQuestionDto, user: any) {
    const newQuestion = this.questionRepo.create({
      ...createQuestionDto,
      company: { id: user.companyId } // ★ここで会社IDをセット
    });
    return this.questionRepo.save(newQuestion);
  }

  // 問題一覧取得：権限によって見える範囲を変える
  async findAll(user: any) {
    if (user.role === 'MASTER') {
      // マスターは全企業の問題が見える
      return this.questionRepo.find({ 
        relations: ['company'] 
      });
    } else {
      // それ以外は「自分の会社の問題」だけが見える
      return this.questionRepo.find({
        where: { company: { id: user.companyId } },
        relations: ['company']
      });
    }
  }

  // 1件削除
  async remove(id: number) {
    return this.questionRepo.delete(id);
  }
}