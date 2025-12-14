import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Department } from './department.entity';
import { Course } from './course.entity';

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => Department, (dept) => dept.company)
  departments: Department[];

  @OneToMany(() => User, (user) => user.company)
  users: User[];

  @OneToMany(() => Course, (course) => course.company)
  courses: Course[];
}