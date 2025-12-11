import { Controller, Get, Param, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Request } from 'express';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  // 🔹 Récupère toutes les missions où le user participe (en tant qu’étudiant ou entreprise)
  @Get('missions')
  async getUserMissions(@Req() req: Request) {
    const user = req.user as any;
    return this.chat.getUserMissions(user.id);
  }

  // 🔹 Récupère les messages d’une mission donnée
  @Get('missions/:id/messages')
  async getMessages(@Param('id') id: number) {
    return this.chat.getMissionMessages(id);
  }

  // 🔹 Envoie un message dans le chat d’une mission
  @Post('missions/:id/messages')
  async sendMessage(
    @Param('id') id: number,
    @Req() req: Request,
    @Body('content') content: string,
  ) {
    const user = req.user as any;
    return this.chat.sendMessage(id, user.id, content);
  }
}
