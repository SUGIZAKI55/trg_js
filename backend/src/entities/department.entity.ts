import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Company } from './company.entity';
import { Section } from './section.entity';
import { User } from './user.entity';

@Entity()
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  company_id: number;

  @ManyToOne(() => Company, (company) => company.departments)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToMany(() => Section, (section) => section.department)
  sections: Section[];

  @OneToMany(() => User, (user) => user.department)
  users: User[];
}