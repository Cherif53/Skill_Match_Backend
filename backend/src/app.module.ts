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
import { ConfigService, ConfigModule } from '@nestjs/config';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 120,
      },
    ]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>("DATABASE_URL"),
        ssl: config.get("NODE_ENV") === "production"
      ? { rejectUnauthorized: false }
      : false,
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
