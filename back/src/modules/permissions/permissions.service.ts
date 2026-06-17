import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserPermissions } from 'src/modules/permissions/permissions.schema';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(UserPermissions.name)
    private userPermissionsModel: Model<UserPermissions>,
  ) {}

  // Asignar rutas permitidas a un usuario
  async assignPermissions(userId: string, routes: string[]) {
    const permissions = await this.userPermissionsModel.findOne({ userId });

    if (permissions) {
      permissions.routes = routes;
      await permissions.save();
      return {
        success: true,
        message: 'Permisos actualizados correctamente',
      };
    } else {
      const newPermissions = new this.userPermissionsModel({ userId, routes });
      await newPermissions.save();
      return {
        success: true,
        message: 'Permisos asignados correctamente',
      };
    }
  }

  // Obtener las rutas permitidas de un usuario
  async getPermissions(userId: string) {
    try {
      if (!userId) {
        throw new Error('UserId is required');
      }
      const permissions = this.userPermissionsModel.findOne({ userId });
      if (!permissions) {
        return {
          success: false,
          message: 'No se encontraron permisos para este usuario',
        };
      }
      return {
        success: true,
        data: permissions,
      };
    } catch (error) {
      throw error;
    }
  }
}
