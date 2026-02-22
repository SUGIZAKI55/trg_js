import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';
import { UserType } from './user.type';
import { QuestionType } from './question.type';

@ObjectType()
export class GenreStats {
  @Field()
  genre: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class OverallStats {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  correct: number;
}

@ObjectType()
export class LearningLogType {
  @Field(() => Int)
  id: number;

  @Field()
  learned_at: Date;

  @Field()
  is_correct: boolean;

  @Field(() => UserType, { nullable: true })
  user?: UserType;

  @Field(() => QuestionType, { nullable: true })
  question?: QuestionType;
}

@ObjectType()
export class DashboardData {
  @Field(() => [GenreStats])
  genre_stats: GenreStats[];

  @Field(() => Int)
  review_count: number;

  @Field(() => OverallStats, { nullable: true })
  overall_stats?: OverallStats;
}

@InputType()
export class LearningLogInput {
  @Field(() => Int)
  questionId: number;

  @Field()
  is_correct: boolean;
}
