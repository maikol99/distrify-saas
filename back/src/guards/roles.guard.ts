import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from 'src/modules/permissions/permissions.service';
import { Request } from 'express';

interface UserJwtPayload {
  id: string;
  username: string;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private permissionsService: PermissionsService,
    private reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as UserJwtPayload;
    const route = request.route.path;

    if (!user || !user.id) {
      throw new ForbiddenException('No se encontró el usuario en la solicitud');
    }


    const userPermissions: any = await this.permissionsService.getPermissions(
      user.id,
    );
    if (!userPermissions || !userPermissions.routes.includes(route)) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a esta ruta',
      );
    }

    return true;
  }
}
