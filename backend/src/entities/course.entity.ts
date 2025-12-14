import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: false })
  is_shared: boolean;

  @Column()
  company_id: number;

  @ManyToOne(() => Company, (company) => company.courses)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  // 簡易化のため質問IDの配列をJSON文字列で保存
  @Column('text')
  question_ids_json: string; 
}