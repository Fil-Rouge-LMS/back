import { CanActivate, Injectable } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  // Skeleton: denies every request until the role check is implemented.
  canActivate(): boolean {
    return false;
  }
}
