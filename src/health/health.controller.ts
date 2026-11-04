import { Controller, Get } from '@nestjs/common';

// Liveness check: answers as long as the API runs. It does not query the
// database, so a database outage does not make the host restart the API.
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'success', data: { status: 'ok' } };
  }
}
