import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // 全ユーザー取得（企業・部署・課の情報も一緒に結合して取得）
  findAll() {
    return this.usersRepository.find({
      relations: ['company', 'department', 'section'],
    });
  }

  // IDで1件取得
  findOne(id: number) {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['company', 'department', 'section'],
    });
  }
}