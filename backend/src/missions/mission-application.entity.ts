import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Column,
  Unique,
} from 'typeorm';
import { Mission } from './mission.entity';
import { User } from '../users/user.entity';

export enum ApplicationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

@Entity('mission_applications')
@Unique(['mission', 'student'])
export class MissionApplication {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Mission, (mission) => mission.applications, {
    onDelete: 'CASCADE',
  })
  mission: Mission;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  student: User;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @CreateDateColumn()
  appliedAt: Date;
}
