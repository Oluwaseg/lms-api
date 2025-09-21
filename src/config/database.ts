import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';
import { ParentChild } from '../entities/ParentChild';
import { Role } from '../entities/Role';
import { User } from '../entities/User';
import { VerificationToken } from '../entities/VerificationToken';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: true,
  entities: [Role, User, VerificationToken, ParentChild],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
