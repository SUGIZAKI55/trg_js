import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Company } from './company.entity';
import { Department } from './department.entity';
import { Section } from './section.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password_hash: string;

  // Role: 'MASTER', 'SUPER_ADMIN', 'ADMIN', 'USER'
  @Column()
  role: string;

  @Column()
  company_id: number;

  @ManyToOne(() => Company, (company) => company.users)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ nullable: true })
  department_id: number;

  @ManyToOne(() => Department, (dept) => dept.users, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column({ nullable: true })
  section_id: number;

  @ManyToOne(() => Section, (section) => section.users, { nullable: true })
  @JoinColumn({ name: 'section_id' })
  section: Section;
}