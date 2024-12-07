import { DataSource } from 'typeorm';
import { connection } from './connection.database';

export const dataSource = new DataSource(connection());
