import { Inject, Injectable } from '@nestjs/common';
import type { Database } from '../db/db.module.js';
import { DRIZZLE } from '../db/db.module.js';

@Injectable()
export class CatalogueRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}
}
