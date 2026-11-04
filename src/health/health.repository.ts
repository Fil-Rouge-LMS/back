import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import type { Database } from '../db/db.module.js';
import { DRIZZLE } from '../db/db.module.js';

@Injectable()
export class HealthRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  // Rejects if the database cannot be reached.
  async ping(): Promise<void> {
    await this.db.execute(sql`SELECT 1`);
  }
}
