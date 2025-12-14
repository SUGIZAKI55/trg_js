import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Department } from './department.entity';
import { User } from './user.entity';

@Entity()
export class Section {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  department_id: number;

  @ManyToOne(() => Department, (dept) => dept.sections)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @OneToMany(() => User, (user) => user.section)
  users: User[];
}