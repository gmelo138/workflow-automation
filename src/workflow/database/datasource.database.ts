import { DataSource } from 'typeorm';
import { connection } from './connection.database';

// Crie e exporte a instância de DataSource
export const dataSource = new DataSource(connection());
