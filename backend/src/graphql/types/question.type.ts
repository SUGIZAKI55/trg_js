import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';
import { CompanyType } from './company.type';

@ObjectType()
export class QuestionType {
  @Field(() => Int)
  id: number;

  @Field()
  type: string; // 'SINGLE' or 'MULTIPLE'

  @Field()
  genre: string;

  @Field()
  title: string;

  @Field(() => [String])
  choices: string[];

  @Field(() => [String])
  answer: string[];

  @Field(() => CompanyType, { nullable: true })
  company?: CompanyType;

  @Field(() => Int, { nullable: true })
  companyId?: number;
}

@InputType()
export class CreateQuestionInput {
  @Field()
  type: string;

  @Field()
  genre: string;

  @Field()
  title: string;

  @Field(() => [String])
  choices: string[];

  @Field(() => [String])
  answer: string[];

  @Field(() => Int, { nullable: true })
  companyId?: number;
}

@InputType()
export class UpdateQuestionInput {
  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  genre?: string;

  @Field({ nullable: true })
  title?: string;

  @Field(() => [String], { nullable: true })
  choices?: string[];

  @Field(() => [String], { nullable: true })
  answer?: string[];
}
