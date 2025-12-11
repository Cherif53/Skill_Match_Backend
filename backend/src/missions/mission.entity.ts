import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { MissionApplication } from './mission-application.entity';
import { Transaction } from '../payments/entities/transaction.entity';
import { Message } from 'src/chat/entities/message.entity';


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
  startHour: string;

  @Column()
  endHour: string;

  @Column({ default: 1 })
  studentCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  hourlyRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalStudentEarnings: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  platformCommission: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalCompanyCost: number;

  @Column({ type: 'enum', enum: MissionStatus, default: MissionStatus.PENDING })
  status: MissionStatus;

  @Column({ default: false })
  paymentValidated: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  paymentDate: Date | null;

  @ManyToOne(() => User, (user) => user.createdMissions, { cascade: true })
  company?: User;

  @ManyToMany(() => User, (user) => user.assignedMissions, { cascade: true })
  @JoinTable({
    name: 'missions_students_users',
    joinColumn: { name: 'mission_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'student_id', referencedColumnName: 'id' },
  })
  students: User[];

  @OneToMany(() => MissionApplication, (app) => app.mission)
  applications: MissionApplication[];

  @OneToMany(() => Transaction, (t) => t.mission)
  transactions: Transaction[];

  @OneToMany(() => Message, (message) => message.mission)
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;
}
