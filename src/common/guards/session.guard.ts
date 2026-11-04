import { CanActivate, Injectable } from '@nestjs/common';

@Injectable()
export class SessionGuard implements CanActivate {
  // Skeleton: denies every request until the session check is implemented.
  canActivate(): boolean {
    return false;
  }
}
