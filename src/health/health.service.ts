import { Injectable, Logger } from '@nestjs/common';
import { HealthRepository } from './health.repository.js';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly healthRepository: HealthRepository) {}

  async isDatabaseUp(): Promise<boolean> {
    try {
      await this.healthRepository.ping();
      return true;
    } catch (error) {
      // The cause stays in the server logs: this route is public.
      this.logger.error('Database health check failed', error);
      return false;
    }
  }
}
