import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { AuthService } from '../../auth/auth.service';
import { AuthPayload, UserType } from '../types/user.type';
import { UseGuards, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthPayload)
  async login(
    @Args('username') username: string,
    @Args('password') password: string,
  ): Promise<AuthPayload> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const loginResult = await this.authService.login(user);
    return {
      token: loginResult.token,
      user: user as any,
      userId: user.id,
      username: user.username,
      role: user.role,
      companyId: user.companyId,
      company: user.company ? { name: user.company.name } : null,
    };
  }

  @Query(() => UserType)
  @UseGuards(JwtAuthGuard)
  async me(@Context() context: any): Promise<any> {
    return context.req.user;
  }
}
