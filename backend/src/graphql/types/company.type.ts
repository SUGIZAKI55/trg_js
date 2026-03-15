import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class CompanyType {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  is_active: boolean;

  @Field(() => [DepartmentType], { nullable: true })
  departments?: DepartmentType[];

  @Field(() => [Object], { nullable: true })
  users?: any[];

  @Field(() => [Object], { nullable: true })
  courses?: any[];
}

@ObjectType()
export class DepartmentType {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => Int)
  company_id: number;

  @Field(() => [SectionType], { nullable: true })
  sections?: SectionType[];
}

@ObjectType()
export class SectionType {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => Int)
  department_id: number;
}
