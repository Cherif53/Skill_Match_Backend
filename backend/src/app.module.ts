import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DocumentsModule } from './documents/documents.module';
import { User } from './users/user.entity';
import { Document } from './documents/document.entity';
import { AdminModule } from './admin/admin.module';
import { MissionsModule } from './missions/missions.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { PaymentsModule } from './payments/payments.module';
import { ChatModule } from './chat/chat.module';




@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
