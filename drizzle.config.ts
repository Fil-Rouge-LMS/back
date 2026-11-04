import { existsSync } from 'node:fs';
import { defineConfig } from 'drizzle-kit';

if (existsSync('.env')) process.loadEnvFile();

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema/index.ts',
  // SQL migrations versioned in the repository, applied with `npm run db:migrate`
  out: './src/db/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
