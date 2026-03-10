import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const isProd = process.env.NODE_ENV === 'production';

const commonConfig = {
  type: 'postgres' as const,
  ssl: isProd
    ? {
        rejectUnauthorized: false,
      }
    : false,
  synchronize: process.env.NODE_ENV !== 'production',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
};

export const AppDataSource = process.env.DATABASE_URL
  ? new DataSource({
      ...commonConfig,
      url: process.env.DATABASE_URL,
    })
  : new DataSource({
      ...commonConfig,
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD ?? '',
      database: process.env.DB_DATABASE ?? 'postgres',
    });