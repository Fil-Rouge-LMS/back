import { Injectable } from '@nestjs/common';
import { ProgressionService } from '../progression/progression.service.js';
import { QuizRepository } from './quiz.repository.js';

@Injectable()
export class QuizService {
  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly progressionService: ProgressionService,
  ) {}
}
