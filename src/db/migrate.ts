// Applies the SQL migrations from src/db/migrations without drizzle-kit,
// which is not installed in the production Docker image.
// Run by the `migrate` service in docker-compose.yml: `node dist/db/migrate.js`.
// It uses the same log as `npm run db:migrate` (table drizzle.__drizzle_migrations):
// a migration that was already applied is never replayed.
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

const db = drizzle(process.env.DATABASE_URL!);

try {
  // path relative to the working directory (/app in the container)
  await migrate(db, { migrationsFolder: './src/db/migrations' });
  console.log('Migrations applied');
} finally {
  // close the pool, otherwise the script never exits
  await db.$client.end();
}
