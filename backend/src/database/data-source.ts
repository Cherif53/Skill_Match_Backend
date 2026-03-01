import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { use } from 'passport';

config();
const isProd = process.env.NODE_ENV === 'production';
const useSSL = process.env.POSTGRES_SSL === 'true' || isProd;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  ssl: useSSL ? {
    rejectUnauthorized: false,
  } : false,
  database: process.env.POSTGRES_DB || 'skillmatch',
  synchronize: process.env.NODE_ENV !== "production",
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
});
