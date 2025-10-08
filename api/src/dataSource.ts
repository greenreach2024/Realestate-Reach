import 'reflect-metadata';
import { DataSource } from 'typeorm';
import HomeShare from './entity/HomeShare.js';
import Home from './entity/Home.js';
import User from './entity/User.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [HomeShare, Home, User],
  migrations: ['src/migrations/*.ts'],
  synchronize: false
});

export default AppDataSource;
