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

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // ★修正: トークンに companyId を追加
  async login(user: any) {
    // 会社に所属していない場合（Masterなど）を考慮して安全に取り出す
    const companyId = user.company ? user.company.id : null;

    const payload = { 
      username: user.username, 
      sub: user.id, 
      role: user.role,
      companyId: companyId // ← 追加
    };
    
    return {
      token: this.jwtService.sign(payload),
      username: user.username,
      role: user.role,
      companyId: companyId,
      userId: user.id
    };
  }

  // ★修正: こちらも同様に companyId を追加
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
      companyId: companyId // ← 追加
    };

    return {
      token: this.jwtService.sign(payload),
      username: user.username,
      role: user.role,
      companyId: companyId
    };
  }
}