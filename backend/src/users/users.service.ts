import { Injectable } from '@nestjs/common';
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

  // ★修正: ユーザーを探すときに「会社情報」も一緒に持ってくる
  async findOneByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ 
      where: { username },
      relations: ['company'] // ← 重要！これでログイン時に会社IDがわかります
    });
  }

  // ★修正: リクエストした人(currentUser)によって返すデータを変える
  async findAll(currentUser: any): Promise<User[]> {
    if (currentUser.role === 'MASTER') {
      // マスターなら全員表示（会社、部署、課の情報もセットで）
      return this.usersRepository.find({
        relations: ['company', 'department', 'section'],
      });
    } else {
      // それ以外なら「自分の会社ID」と一致するユーザーだけ表示
      return this.usersRepository.find({
        where: { 
          company: { id: currentUser.companyId } 
        },
        relations: ['company', 'department', 'section'],
      });
    }
  }

  async findOne(id: number): Promise<User | undefined> {
    return this.usersRepository.findOne({ 
      where: { id },
      relations: ['company', 'department', 'section'] 
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password || 'password123', salt);
    
    // ※会社IDなどがDTOに含まれている場合の処理が必要ですが、
    // まずは基本的な作成処理として記述します
    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.usersRepository.save(newUser);
  }
}