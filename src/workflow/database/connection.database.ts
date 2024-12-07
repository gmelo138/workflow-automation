import * as dotenv from 'dotenv';
import { DataSourceOptions } from 'typeorm';

dotenv.config();

export const connection = (): DataSourceOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../entities/*.entity{.js,.ts}'],
  migrations: [__dirname + '/migration/*.{js,ts}'],
  migrationsTableName: 'workflow_migrations',
  synchronize: true,
  logging: false,
});
