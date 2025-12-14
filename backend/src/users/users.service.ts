import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt'; // パスワード暗号化用

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // 全員取得
  findAll() {
    return this.usersRepository.find({
      relations: ['company', 'department', 'section'],
    });
  }

  // IDで1人取得
  findOne(id: number) {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['company', 'department', 'section'],
    });
  }

  // ★追加: ユーザー新規作成
  async create(userData: any) {
    // 1. パスワードを暗号化する
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // 2. 保存用データを作成（会社IDを関連付け）
    const newUser = this.usersRepository.create({
      username: userData.username,
      password: hashedPassword,
      role: userData.role,
      // 会社IDがある場合のみ関連付け
      company: userData.companyId ? { id: Number(userData.companyId) } : null,
    });

    // 3. データベースに保存
    return this.usersRepository.save(newUser);
  }

  // ユーザー名で検索（ログイン用）
  findOneByUsername(username: string) {
    return this.usersRepository.findOne({
      where: { username },
      relations: ['company'], // 会社情報も必要
    });
  }
}