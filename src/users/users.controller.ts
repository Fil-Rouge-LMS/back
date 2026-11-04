import { Controller, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { SessionGuard } from '../common/guards/session.guard.js';
import { UsersService } from './users.service.js';

@Controller('users')
@UseGuards(SessionGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
