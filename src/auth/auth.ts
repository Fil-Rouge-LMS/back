// Minimal Better Auth configuration: email + password sign-in.
// No admin plugin: roles are managed by our role and user_role tables.
// The authentication routes are not wired into NestJS yet.
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { betterAuth } from 'better-auth';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { Database } from '../db/db.module.js';
import * as schema from '../db/schema/index.js';

// A function rather than a constant so the existing Drizzle client can be
// passed in (the seed's client today, the DbModule's client later).
export function createAuth(db: Database) {
  return betterAuth({
    // BETTER_AUTH_SECRET and BETTER_AUTH_URL are read from the environment variables
    database: drizzleAdapter(db, { provider: 'pg', schema }),
    emailAndPassword: { enabled: true },
  });
}

// Instance read by the Better Auth CLI (`npx auth@latest generate`), which looks
// for an `auth` export in src/auth/auth.ts. The pg pool only connects on the
// first query: importing this file opens no connection.
export const auth = createAuth(drizzle(process.env.DATABASE_URL!, { schema }));
