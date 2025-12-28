import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  // ユーザー認証
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // ログイン処理
  async login(user: any) {
    const companyId = user.company ? user.company.id : null;

    const payload = { 
      username: user.username, 
      sub: user.id, 
      role: user.role,
      companyId: companyId 
    };
    
    return {
      token: this.jwtService.sign(payload),
      username: user.username,
      role: user.role,
      userId: user.id,
      companyId: companyId,
      
      // ★ここが超重要！
      // これがないとNavbarに「Client Corp A」と表示されません
      company: user.company ? { name: user.company.name } : null
    };
  }

  // なりすましログイン（開発用）
  async impersonate(userId: number) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const companyId = user.company ? user.company.id : null;
    
    const payload = { 
      username: user.username, 
      sub: user.id, 
      role: user.role,
      companyId: companyId 
    };

    return {
      token: this.jwtService.sign(payload),
      username: user.username,
      role: user.role,
      companyId: companyId,
      // なりすまし時も会社名を表示したい場合はここにも追加できますが、
      // まずは通常ログインで確認しましょう
      company: user.company ? { name: user.company.name } : null
    };
  }
}