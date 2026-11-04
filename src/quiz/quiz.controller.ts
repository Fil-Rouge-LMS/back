import { Controller, UseGuards } from '@nestjs/common';
import { SessionGuard } from '../common/guards/session.guard.js';
import { QuizService } from './quiz.service.js';

@Controller('quiz')
@UseGuards(SessionGuard)
export class QuizController {
  constructor(private readonly quizService: QuizService) {}
}
