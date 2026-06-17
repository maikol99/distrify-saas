import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * ShopGuard — Enforces multitenant isolation.
 * Overwrites any shopId in params/query/body with the one
 * from the authenticated user's token, so users can never
 * access data from another shop by manipulating the request.
 */
@Injectable()
export class ShopGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Si no hay usuario autenticado, dejar que JwtAuthGuard lo rechace
    if (!user) return true;

    // Super admin no tiene restricción de shopId
    const superAdminId = this.configService.get<string>('SUPER_ADMIN_ID');
    if (superAdminId && user.id === superAdminId) return true;

    if (!user.shopId) {
      throw new ForbiddenException('No se pudo determinar el negocio del usuario');
    }

    // Sobreescribir SIEMPRE el shopId con el del token — el cliente no puede manipularlo
    if (request.params) {
      if ('shopId' in request.params) request.params.shopId = user.shopId;
      if ('id' in request.params && request.route?.path?.includes('/get-clients/')) {
        request.params.id = user.shopId;
      }
    }

    if (request.query && 'shopId' in request.query) {
      (request.query as any).shopId = user.shopId;
    }

    if (request.body && typeof request.body === 'object' && 'shopId' in request.body) {
      request.body.shopId = user.shopId;
    }

    return true;
  }
}
