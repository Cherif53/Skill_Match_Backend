import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://skillmatch.local:5173'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, any>();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    console.log('ChatGateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) throw new Error('Missing token');

      const decoded = this.jwt.verify(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });

      console.log(`✅ ${decoded.email} connecté via socket (${client.id})`);
      this.connectedUsers.set(client.id, decoded);
    } catch (err) {
      console.error('❌ Connexion socket refusée : Token invalide');
      console.log("Token reçu :", client.handshake.auth?.token);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() missionId: number,
    @ConnectedSocket() client: Socket,
  ) {
    const room = `mission-${missionId}`;
    client.join(room);
    console.log(`👥 Client ${client.id} rejoint ${room}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    data: {
      room?: string;
      content: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user = this.connectedUsers.get(client.id);
      if (!user) throw new Error('Utilisateur non authentifié');

      if (!data.room) {
      console.warn('⚠️ Aucune room reçue pour le message:', data);
      return;
    }

      const missionId = Number(data.room.replace('mission-', ''));

      // ✅ sauvegarde dans la base avec senderId venant du token
      const message = await this.chatService.createMessage({
        missionId,
        senderId: user.sub,
        content: data.content,
      });

      // ✅ broadcast du message
      this.server.to(data.room).emit('receiveMessage', {
        id: message.id,
        content: message.content,
        senderName: user.email || 'Utilisateur',
        createdAt: message.createdAt,
      });
    } catch (error: any) {
      console.error('❌ Erreur d’envoi de message :', error.message);
    }
  }
}
