import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class LearningLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ nullable: true })
  course_id: number;

  @Column()
  score: number;

  @Column()
  is_passed: boolean;

  @CreateDateColumn()
  finished_at: Date;
}