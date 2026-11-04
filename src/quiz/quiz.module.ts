import { Module } from '@nestjs/common';
import { ProgressionModule } from '../progression/progression.module.js';
import { QuizController } from './quiz.controller.js';
import { QuizRepository } from './quiz.repository.js';
import { QuizService } from './quiz.service.js';

@Module({
  imports: [ProgressionModule],
  controllers: [QuizController],
  providers: [QuizService, QuizRepository],
})
export class QuizModule {}
