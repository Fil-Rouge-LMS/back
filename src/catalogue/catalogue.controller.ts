import { Controller, UseGuards } from '@nestjs/common';
import { SessionGuard } from '../common/guards/session.guard.js';
import { CatalogueService } from './catalogue.service.js';

@Controller('catalogue')
@UseGuards(SessionGuard)
export class CatalogueController {
  constructor(private readonly catalogueService: CatalogueService) {}
}
