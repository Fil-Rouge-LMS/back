import { Injectable } from '@nestjs/common';
import { CatalogueRepository } from './catalogue.repository.js';

@Injectable()
export class CatalogueService {
  constructor(private readonly catalogueRepository: CatalogueRepository) {}
}
