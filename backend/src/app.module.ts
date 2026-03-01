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
//import { BootstrapController } from './bootstrap/bootstrap.controller';



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
      useFactory: (config: ConfigService) => {
        const isProd = config.get<string>('NODE_ENV') === 'production';

        if (isProd) {
          return {
            type: 'postgres',
            url: config.get<string>('DATABASE_URL'),
            ssl: { rejectUnauthorized: false },
            autoLoadEntities: true,
            synchronize: false, // recommandé en prod
          };
        }

        // ✅ LOCAL (Docker / Postgres sans SSL)
        return {
          type: 'postgres',
          host: config.get<string>('POSTGRES_HOST') || 'localhost',
          port: parseInt(config.get<string>('POSTGRES_PORT') || '5432', 10),
          username: config.get<string>('POSTGRES_USER') || 'postgres',
          password: config.get<string>('POSTGRES_PASSWORD') || 'postgres',
          database: config.get<string>('POSTGRES_DB') || 'skillmatch',
          ssl: false,
          autoLoadEntities: true,
          synchronize: config.get('DB_SYNC') === 'true',
        };
      },
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
  controllers: [
    //BootstrapController, // N'oublie pas d'importer ce controller
  ],
})
export class AppModule { }
