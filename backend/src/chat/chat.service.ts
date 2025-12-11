import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Message } from './entities/message.entity';
import { User } from '../users/user.entity';
import { Mission } from 'src/missions/mission.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Mission) private readonly missionRepo: Repository<Mission>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) { }


  createMessage(data: Partial<Message>) {
    const msg = this.messageRepo.create(data);
    return this.messageRepo.save(msg);
  }

  // 🔹 Récupère les missions où le user participe
  async getUserMissions(userId: number) {
    const user = await this.missionRepo.manager.findOne(User, {
      where: { id: userId },
    });

    if (!user) return [];

    // ✅ Si c’est un admin → il voit toutes les missions
    if (user.role === 'ADMIN') {
      return this.missionRepo.find({
        relations: ['company', 'students'],
        order: { id: 'DESC' },
      });
    }

    // ✅ Sinon (student ou company), missions liées à lui
    return this.missionRepo.find({
      where: [
        { company: { id: userId } },
        { students: { id: userId } },
      ],
      relations: ['company', 'students'],
    });
  }


  // 🔹 Récupère tous les messages d’une mission
  async getMissionMessages(missionId: number) {
    return this.messageRepo.find({
      where: { mission: { id: missionId } },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }

  // 🔹 Envoie un message dans le chat
  async sendMessage(missionId: number, senderId: number, content: string) {
    const msg = this.messageRepo.create({
      content,
      mission: { id: missionId } as Mission,
      sender: { id: senderId } as User,
    });
    return this.messageRepo.save(msg);
  }

}
