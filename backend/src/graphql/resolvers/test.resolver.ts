import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class TestResolver {
  @Query(() => String)
  hello(): string {
    return 'GraphQL API is working!';
  }
}
