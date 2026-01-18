import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Company } from './company.entity';
import { Department } from './department.entity';
import { Section } from './section.entity';
import { LearningLog } from './learning-log.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  /**
   * 権限 (Role)
   * 'master', 'admin', 'staff' 等
   */
  @Column()
  role: string;

  // --- リレーション設定 ---

  /**
   * 所属企業 (Company)
   * nullable: false により、所属なしでの登録を物理的に禁止します。
   */
  @ManyToOne(() => Company, (company) => company.users, { 
    nullable: false,   // ★ DBレベルでNULLを禁止
    onDelete: 'CASCADE' // 企業が削除されたらそのユーザーも削除
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  /**
   * 外部キーとしての会社ID
   * プログラム側からIDを直接指定して保存しやすくするために定義
   */
  @Column({ name: 'company_id' })
  companyId: number;

  /**
   * 部署 (任意)
   */
  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column({ name: 'department_id', nullable: true })
  departmentId: number;

  /**
   * 課 (任意)
   */
  @ManyToOne(() => Section, { nullable: true })
  @JoinColumn({ name: 'section_id' })
  section: Section;

  @Column({ name: 'section_id', nullable: true })
  sectionId: number;

  /**
   * 学習ログとのリレーション
   */
  @OneToMany(() => LearningLog, (log) => log.user)
  learningLogs: LearningLog[];
}