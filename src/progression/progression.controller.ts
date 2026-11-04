import { Controller, UseGuards } from '@nestjs/common';
import { SessionGuard } from '../common/guards/session.guard.js';
import { ProgressionService } from './progression.service.js';

@Controller('progression')
@UseGuards(SessionGuard)
export class ProgressionController {
  constructor(private readonly progressionService: ProgressionService) {}
}
