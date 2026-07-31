import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { SettingsService } from 'src/modules/settings/settings.service';

@Injectable()
export class TurnsEnabledGuard implements CanActivate {
  constructor(private readonly settingsService: SettingsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const shopId = request.user?.shopId;
    if (!shopId) throw new ForbiddenException('No se pudo determinar el negocio.');

    const settings = await this.settingsService.findOrCreate(shopId.toString());

    if (!settings.turnsEnabled) {
      throw new ForbiddenException(
        'El sistema de Turnos está desactivado. Activalo en Configuración → Módulos para poder usarlo.',
      );
    }

    return true;
  }
}
