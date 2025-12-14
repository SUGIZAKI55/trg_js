import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';
export declare class CompaniesService {
    private companiesRepository;
    constructor(companiesRepository: Repository<Company>);
    findAll(): Promise<Company[]>;
    create(name: string): Promise<Company>;
}
