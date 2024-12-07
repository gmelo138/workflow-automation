import 'reflect-metadata';
import dotenv from 'dotenv';

dotenv.config();

module.exports = () => {
  for (const env in process.env) {
    if (!env.includes('_DATABASE_URL')) continue;

    // eslint-disable-next-line no-console
    console.info('Configuring tests using database URL:', process.env[env]);

    if (!process.env[env].includes('localhost')) process.exit(1);
  }
};
