import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// 👇 On importe explicitement les entités ici
import { User } from '../users/user.entity';
import { Document } from '../documents/document.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: process.env.DB_HOST || 'skillmatch_db',
        port: parseInt(process.env.DB_PORT ?? '5432', 10),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'skillmatch',
        synchronize: false,
        logging: true,

        // 👇 ICI la clé : on scanne toutes les entités compilées dans dist/
        entities: [__dirname + '/../**/*.entity.{js,ts}'],
      }),
    }),
  ],
})
export class DatabaseModule {}
