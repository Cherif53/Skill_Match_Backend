import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

export enum DocumentStatus { PENDING = 'PENDING', APPROVED = 'APPROVED', REJECTED = 'REJECTED' }
export enum DocumentType {
  SCHOOL_CERTIFICATE = 'SCHOOL_CERTIFICATE', // attestation de scolarité
  RESIDENCE_PERMIT = 'RESIDENCE_PERMIT',     // titre de séjour
  AUTO_ENTREPRENEUR = 'AUTO_ENTREPRENEUR',   // justificatif auto-entrepreneur
  OTHER = 'OTHER',
}

@Entity({ name: 'documents' })
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: DocumentType, default: DocumentType.OTHER })
  type: DocumentType;
  
  @Column()
  name: string;

  @Column()
  url: string;

  @Column({ type: 'enum', enum: DocumentStatus, default: DocumentStatus.PENDING })
  status: DocumentStatus;

  @Column({ nullable: true })
  comment?: string;

  @ManyToOne(() => User, (user) => user.documents, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'text', nullable: true })
  reviewComment?: string;


  @CreateDateColumn()
  createdAt: Date;
}
