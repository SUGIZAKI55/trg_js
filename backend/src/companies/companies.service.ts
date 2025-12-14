import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) {}

  findAll() {
    return this.companiesRepository.find();
  }

  create(name: string) {
    const company = this.companiesRepository.create({ name });
    return this.companiesRepository.save(company);
  }
}