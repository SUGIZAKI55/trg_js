import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'SINGLE' }) // 'SINGLE' か 'MULTIPLE' が入ります
  type: string;

  @Column()
  genre: string;

  @Column()
  title: string;

  @Column()
  choices: string; // "A:選択肢1|B:選択肢2|C:選択肢3|D:選択肢4" の形で保存

  @Column()
  answer: string; // 単一なら "A", 複数なら "A,C" のようにカンマ区切りで保存

  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}