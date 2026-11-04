import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { HealthService } from './health.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  // Liveness check: answers as long as the API runs. It does not query the
  // database, so a database outage does not make the host restart the API.
  @Get()
  check() {
    return { status: 'success', data: { status: 'ok' } };
  }

  // Manual check of the database connection. Do not use it as the host's
  // health check path.
  @Get('db')
  async checkDatabase() {
    if (!(await this.healthService.isDatabaseUp())) {
      throw new ServiceUnavailableException({
        status: 'error',
        message: 'Database unavailable',
      });
    }
    return { status: 'success', data: { database: 'ok' } };
  }
}
