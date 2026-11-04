import { Module } from '@nestjs/common';
import { CatalogueModule } from '../catalogue/catalogue.module.js';
import { ProgressionController } from './progression.controller.js';
import { ProgressionRepository } from './progression.repository.js';
import { ProgressionService } from './progression.service.js';

@Module({
  imports: [CatalogueModule],
  controllers: [ProgressionController],
  providers: [ProgressionService, ProgressionRepository],
  exports: [ProgressionService],
})
export class ProgressionModule {}
