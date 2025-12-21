import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'SECRET_KEY', // ※auth.module.tsと同じ鍵
    });
  }

  async validate(payload: any) {
    // ★修正: ここで返した値が req.user になります。companyIdを追加！
    return { 
      userId: payload.sub, 
      username: payload.username, 
      role: payload.role,
      companyId: payload.companyId // ← これがないとコントローラーで使えません
    };
  }
}