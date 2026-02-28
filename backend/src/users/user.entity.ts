import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Document } from '../documents/document.entity';
import { Mission } from '../missions/mission.entity';
import { Transaction } from 'src/payments/entities/transaction.entity';
import { Message } from 'src/chat/entities/message.entity';


export enum UserRole {
  STUDENT = 'STUDENT',
  COMPANY = 'COMPANY',
  ADMIN = 'ADMIN',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  // ✅ Champs Entreprise (nullable pour les STUDENT/ADMIN)
  @Column({ nullable: true })
  companyName?: string;

  @Column({ nullable: true })
  siret?: string;

  @Column({ nullable: true })
  iban?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  phone?: string;

  @OneToMany(() => Document, (doc) => doc.user)
  documents: Document[];

  @Column({ type: 'text', nullable: true })
  refreshTokenHash?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ✅ Missions créées par l'entreprise
  @OneToMany(() => Mission, (mission) => mission.company)
  createdMissions: Mission[];

  // ✅ Missions auxquelles l'étudiant participe
  @ManyToMany(() => Mission, (mission) => mission.students)
  assignedMissions: Mission[];

  @OneToMany(() => Transaction, (transaction) => transaction.student)
  transactions: Transaction[];

  @OneToMany(() => Message, (msg) => msg.sender)
  messages: Message[];
}
