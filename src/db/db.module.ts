import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/index.js';

export const PG_POOL = Symbol('PG_POOL');
export const DRIZZLE = Symbol('DRIZZLE');

export type Database = NodePgDatabase<typeof schema>;

// Global: other modules inject the client with @Inject(DRIZZLE)
// without having to import DbModule.
@Global()
@Module({
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new Pool({
          connectionString: config.getOrThrow<string>('DATABASE_URL'),
        }),
    },
    {
      provide: DRIZZLE,
      inject: [PG_POOL],
      // passing the schema enables relational queries (db.query.course.findMany...)
      useFactory: (pool: Pool): Database => drizzle({ client: pool, schema }),
    },
  ],
  exports: [DRIZZLE],
})
export class DbModule implements OnApplicationShutdown {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  // close the connections when the application stops
  async onApplicationShutdown() {
    await this.pool.end();
  }
}
