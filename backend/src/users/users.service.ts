import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * ユーザー名からユーザーを検索（ログイン用）
   */
  async findOneByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ 
      where: { username },
      relations: ['company'] 
    });
  }

  /**
   * ユーザー一覧の取得（権限による制御）
   */
  async findAll(currentUser: any): Promise<User[]> {
    // デバッグログ
    console.log('--- UserList Access Debug ---');
    console.log('Current User:', currentUser);

    // ロールを大文字に統一して判定（判定漏れ防止）
    const role = currentUser.role ? String(currentUser.role).toUpperCase() : '';
    console.log('Normalized Role:', role);

    if (role === 'MASTER') {
      // MASTERは全データを取得
      return this.usersRepository.find({
        relations: ['company', 'department', 'section'],
      });
    } else {
      // それ以外は自社データのみ
      return this.usersRepository.find({
        where: { 
          company: { id: currentUser.companyId } 
        },
        relations: ['company', 'department', 'section'],
      });
    }
  }

  /**
   * IDからユーザーを一件取得
   */
  async findOne(id: number): Promise<User | undefined> {
    return this.usersRepository.findOne({ 
      where: { id },
      relations: ['company', 'department', 'section'] 
    });
  }

  /**
   * 新規ユーザー作成
   * Roleの正規化（大文字統一）とパスワードハッシュ化を行う
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password || 'password123', salt);
    
    // ★ここが重要：role を大文字に変換。未指定なら 'USER'
    const normalizedRole = createUserDto.role ? createUserDto.role.toUpperCase() : 'USER';
    
    const newUser = this.usersRepository.create({
      ...createUserDto,
      role: normalizedRole, // 正規化した値を使用
      password: hashedPassword,
    });
    
    return this.usersRepository.save(newUser);
  }

  /**
   * ユーザー削除
   */
  async remove(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`ID ${id} のユーザーは見つかりません。`);
    }
    await this.usersRepository.delete(id);
  }
}