import { Controller, UseGuards } from '@nestjs/common';
import { SessionGuard } from '../common/guards/session.guard.js';
import { MediaService } from './media.service.js';

@Controller('media')
@UseGuards(SessionGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}
}
