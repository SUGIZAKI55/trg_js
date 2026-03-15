import { Resolver, Query, Args, Int, InputType, Field } from '@nestjs/graphql';
import { UserType } from '../types/user.type';
import { UsersService } from '../../users/users.service';

@InputType()
export class CreateUserInput {
  @Field()
  username: string;

  @Field({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  role?: string;

  @Field(() => Int, { nullable: true })
  companyId?: number;
}

@Resolver()
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => [UserType])
  async users(): Promise<UserType[]> {
    const users = await this.usersService.findAll({});
    return users as any;
  }

  @Query(() => UserType, { nullable: true })
  async user(@Args('id', { type: () => Int }) id: number): Promise<UserType> {
    return this.usersService.findOne(id) as any;
  }
}
