import { ObjectType, Field, Int } from '@nestjs/graphql';
import { CompanyType } from './company.type';
import { LearningLogType } from './learning-log.type';

@ObjectType()
export class CompanyInfo {
  @Field()
  name: string;
}

@ObjectType()
export class UserType {
  @Field(() => Int)
  id: number;

  @Field()
  username: string;

  @Field()
  role: string;

  @Field(() => CompanyType)
  company: CompanyType;

  @Field(() => Int)
  companyId: number;

  @Field({ nullable: true })
  department?: any;

  @Field({ nullable: true })
  section?: any;

  @Field(() => [LearningLogType], { nullable: true })
  learningLogs?: LearningLogType[];
}

@ObjectType()
export class AuthPayload {
  @Field()
  token: string;

  @Field(() => UserType)
  user: UserType;

  @Field(() => Int)
  userId: number;

  @Field()
  username: string;

  @Field()
  role: string;

  @Field(() => Int)
  companyId: number;

  @Field(() => CompanyInfo, { nullable: true })
  company?: CompanyInfo;
}
