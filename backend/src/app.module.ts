import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DocumentsModule } from './documents/documents.module';
import { User } from './users/user.entity';
import { Document } from './documents/document.entity';
import { AdminModule } from './admin/admin.module';
import { MissionsModule } from './missions/missions.module';
import { PaymentsModule } from './payments/payments.module';
import { ChatModule } from './chat/chat.module';
import { ThrottlerModule } from "@nestjs/throttler";



@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 120,
      },
    ]),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432),
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    TypeOrmModule.forFeature([User, Document]),
    UsersModule,
    AuthModule,
    DocumentsModule,
    AdminModule,
    MissionsModule,
    PaymentsModule,
    ChatModule,
  ],
})
export class AppModule {}
