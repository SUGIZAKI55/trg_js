import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Question } from './question.entity';

@Entity()
export class LearningLog {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  learned_at: Date;

  @Column()
  is_correct: boolean;

  // ★これを追加（Userとのつながり）
  @ManyToOne(() => User, (user) => user.learningLogs)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'question_id' })
  question: Question;
}