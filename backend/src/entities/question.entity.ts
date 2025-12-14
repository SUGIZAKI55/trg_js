import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  genre: string;

  @Column()
  title: string;

  @Column()
  choices: string; // "A:xxx|B:yyy" or JSON

  @Column()
  answer: string;

  @Column({ type: 'text', nullable: true })
  explanation: string;

  @Column({ nullable: true })
  company_id: number;
}