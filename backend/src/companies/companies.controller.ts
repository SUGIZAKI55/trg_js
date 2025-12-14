import { Controller, Get, Post, Body } from '@nestjs/common';
import { CompaniesService } from './companies.service';

@Controller('api/companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  findAll() {
    return this.companiesService.findAll();
  }

  @Post()
  create(@Body('name') name: string) {
    return this.companiesService.create(name);
  }
}