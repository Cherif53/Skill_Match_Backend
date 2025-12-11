import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Mission } from '../../missions/mission.entity';
import { User } from '../../users/user.entity';

export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amountGross: number; // total facturé à l’entreprise

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  commission: number; // part de la plateforme (30%)

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  payoutToStudent: number; // montant reversé à l’étudiant

  @Column({ type: 'timestamptz' })
  paymentDate: Date;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.SUCCESS })
  status: TransactionStatus;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Mission, (mission) => mission.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'missionId' })
  mission: Mission;

  @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'studentId' })
  student: User;
}
