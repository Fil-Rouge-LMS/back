import { Injectable } from '@nestjs/common';
import { CatalogueService } from '../catalogue/catalogue.service.js';
import { ProgressionRepository } from './progression.repository.js';

@Injectable()
export class ProgressionService {
  constructor(
    private readonly progressionRepository: ProgressionRepository,
    private readonly catalogueService: CatalogueService,
  ) {}
}
