import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'SINGLE' })
  type: string;

  @Column()
  genre: string;

  @Column()
  title: string;

  @Column()
  choices: string;

  @Column()
  answer: string;

  // ★追加: データベース上の 'company_id' カラムを TypeScript側で 'companyId' として扱う
  @Column({ name: 'company_id', nullable: true })
  companyId: number;

  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}