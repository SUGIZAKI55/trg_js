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

  // ★ここを修正！
  async login(user: any) {
    // ペイロード（許可証の中身）に role を追加する
    const payload = { 
      username: user.username, 
      sub: user.id, 
      role: user.role // ← これがないと管理者だと認識されません！
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      // フロントエンドで使いやすいように、ユーザー情報も返しておくと便利です
      user: payload 
    };
  }
  
  // impersonateメソッドがある場合はそのまま残してください
  async impersonate(userId: number) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}