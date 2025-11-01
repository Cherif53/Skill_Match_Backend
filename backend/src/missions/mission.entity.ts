import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum MissionStatus {
  PENDING = 'PENDING',
  STAFFED = 'STAFFED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('missions')
export class Mission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  location: string;

  @Column({ type: 'date' })
  date: Date;

  @Column()
  startHour: string; // format "09:00"

  @Column()
  endHour: string; // format "17:00"

  @Column({ type: 'int' })
  studentCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 16.0 })
  hourlyRate: number; // taux fixe par étudiant

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalStudentEarnings: number; // salaire total pour tous les étudiants

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  platformCommission: number; // 30 % de la facture totale

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalCompanyCost: number; // earnings + commission

  @ManyToOne(() => User, (user) => user.createdMissions)
  company: User;

  @ManyToMany(() => User, (user) => user.assignedMissions)
  @JoinTable()
  assignedStudents: User[];

  @ManyToMany(() => User)
  @JoinTable()
  applicants: User[];

  @Column({
    type: 'enum',
    enum: MissionStatus,
    default: MissionStatus.PENDING,
  })
  status: MissionStatus;

  @CreateDateColumn()
  createdAt: Date;
}
