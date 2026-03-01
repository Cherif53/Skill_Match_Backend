import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { use } from 'passport';

config();
const isProd = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL, // pour Heroku
  ssl: isProd ? {
    rejectUnauthorized: false,
  } : false,
  synchronize: process.env.NODE_ENV !== "production",
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
});
