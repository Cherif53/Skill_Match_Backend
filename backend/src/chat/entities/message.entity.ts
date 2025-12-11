import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Mission } from 'src/missions/mission.entity';
import { User } from 'src/users/user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  // 🔗 Relation avec l’expéditeur (étudiant, entreprise ou admin)
  @ManyToOne(() => User, (user) => user.messages, { eager: true })
  sender: User;

  @Column()
  senderId: number;

  // 🔗 Relation avec la mission concernée
  @ManyToOne(() => Mission, (mission) => mission.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'missionId' })
  mission: Mission;

  @Column()
  missionId: number;

  @CreateDateColumn()
  createdAt: Date;
}
