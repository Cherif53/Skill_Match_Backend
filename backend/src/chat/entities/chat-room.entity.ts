import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Message } from './message.entity';
import { Mission } from '../../missions/mission.entity';

@Entity('chat_rooms')
export class ChatRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['MISSION', 'SUPPORT'], default: 'SUPPORT' })
  type: 'MISSION' | 'SUPPORT';

  @ManyToMany(() => User, { eager: true })
  @JoinTable({
    name: 'chat_room_users',
    joinColumn: { name: 'room_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  participants: User[];

  @OneToMany(() => Message, (msg) => msg.mission, { cascade: true })
  messages: Message[];

  @ManyToMany(() => Mission, { nullable: true })
  @JoinTable({
    name: 'chat_room_missions',
    joinColumn: { name: 'room_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'mission_id', referencedColumnName: 'id' },
  })
  missions?: Mission[];

  @CreateDateColumn()
  createdAt: Date;
}
