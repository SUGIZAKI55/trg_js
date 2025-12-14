import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Company } from './company.entity';
import { Department } from './department.entity';
import { Section } from './section.entity';
import { LearningLog } from './learning-log.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  // ★これを忘れていたのが原因！
  @Column()
  password: string;

  @Column()
  role: string;

  // --- リレーション設定 ---
  
  @ManyToOne(() => Company, (company) => company.users, { nullable: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => Section, { nullable: true })
  @JoinColumn({ name: 'section_id' })
  section: Section;

  @OneToMany(() => LearningLog, (log) => log.user)
  learningLogs: LearningLog[];
}