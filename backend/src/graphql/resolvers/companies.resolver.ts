import { Resolver, Query, Args, Int, InputType, Field } from '@nestjs/graphql';
import { CompanyType } from '../types/company.type';
import { CompaniesService } from '../../companies/companies.service';

@InputType()
export class CreateCompanyInput {
  @Field()
  name: string;
}

@Resolver()
export class CompaniesResolver {
  constructor(private companiesService: CompaniesService) {}

  @Query(() => [CompanyType])
  async companies(): Promise<CompanyType[]> {
    return this.companiesService.findAll() as any;
  }
}
