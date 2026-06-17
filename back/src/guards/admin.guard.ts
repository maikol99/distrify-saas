import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const superAdminId = this.configService.get<string>('SUPER_ADMIN_ID');

    if (!user || !superAdminId || user.id !== superAdminId) {
      throw new ForbiddenException('Acceso denegado. Solo el administrador puede acceder.');
    }

    return true;
  }
}
