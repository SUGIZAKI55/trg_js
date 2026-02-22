import { CompanyType } from '../types/company.type';
import { CompaniesService } from '../../companies/companies.service';
export declare class CreateCompanyInput {
    name: string;
}
export declare class CompaniesResolver {
    private companiesService;
    constructor(companiesService: CompaniesService);
    companies(): Promise<CompanyType[]>;
}
