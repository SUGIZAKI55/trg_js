import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(username: string, pass: string) {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!user) throw new UnauthorizedException('User not found');

    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (!isMatch) throw new UnauthorizedException('Invalid password');

    const payload = { 
      sub: user.id, 
      username: user.username, 
      role: user.role,
      companyId: user.company_id
    };
    
    return {
      token: this.jwtService.sign(payload),
      username: user.username,
      role: user.role
    };
  }

  // なりすましログイン (Master Only)
  async impersonate(targetUserId: number) {
    const user = await this.usersRepository.findOne({ where: { id: targetUserId } });
    if (!user) throw new UnauthorizedException();
    
    const payload = { 
        sub: user.id, 
        username: user.username, 
        role: user.role, 
        companyId: user.company_id 
    };
    return {
      token: this.jwtService.sign(payload),
      username: user.username,
      role: user.role
    };
  }
}