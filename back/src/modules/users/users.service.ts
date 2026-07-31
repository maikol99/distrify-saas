import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from './users.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(Users.name) private usersModel: Model<Users>) {}
  //Obtener datos usuario
  async getUser(id: string) {
    try {
      if (!id) {
        throw new NotFoundException('ID no encontrado');
      }
      const user = await this.usersModel.findById({ _id: id });
      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado',
        };
      }
      return {
        success: true,
        message: 'Usuario encontrado',
        user,
      };
    } catch (error) {
      throw error;
    }
  }

  //Obtener datos usuarios de un negocio
  async getUsers(shopId: string) {
    try {
      if (!shopId) {
        throw new NotFoundException('ID no encontrado');
      }
      const users = await this.usersModel.find({ shopId });

      if (users.length === 0) {
        return {
          success: false,
          message: 'Usuarios no encontrados',
        };
      }

      return {
        success: true,
        message: 'Usuarios encontrados',
        users,
      };
    } catch (error) {
      throw error;
    }
  }
  //Actualizar usuario
  async updateUser(id: string, body: any): Promise<any> {
    try {
      if (!id) {
        throw new NotFoundException('ID no encontrado');
      }
      const user = await this.usersModel.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
      });

      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado',
        };
      }

      return {
        success: true,
        message: 'Usuario actualizado',
        user,
      };
    } catch (error) {
      throw error;
    }
  }

  //Eliminar usuario
  async deleteUser(userId: string) {
    try {
      const deletedUser = await this.usersModel.findByIdAndDelete({
        _id: userId,
      });
      if (deletedUser) {
        return {
          success: true,
          message: 'Usuario eliminado',
        };
      } else {
        return {
          success: false,
          message: 'Usuario no encontrado',
        };
      }
    } catch (error) {
      throw error;
    }
  }

  //Buscar usuarios de un negocio por nombre
  async searchUsersByName(shopId: string, name: string) {
    try {
      if (!shopId || !name) {
        throw new NotFoundException('ID o nombre no encontrado');
      }
      const users = await this.usersModel
        .find({ shopId, username: { $regex: name, $options: 'i' } })
        .exec();

      if (users.length === 0) {
        return {
          success: false,
          message: 'Usuarios no encontrados',
        };
      }

      return {
        success: true,
        message: 'Usuarios encontrados',
        users,
      };
    } catch (error) {
      throw error;
    }
  }

  //Traer todos los usuarios del sistema
  async getAllUsers() {
    try {
      const users = await this.usersModel.find();
      return {
        success: true,
        message: 'Usuarios encontrados',
        users,
      };
    } catch (error) {
      throw error;
    }
  }

  //?HABILITAR TODAS LAS RUTAS A TODOS LOS USUARIOS POR UNICA VEZ PARA MIGRAR DATOS
  async enableAllRoutesForAllUsers() {
    try {
      const DEFAULT_ROUTES_ALLOWED = [
        'ventas',
        'proveedores',
        'inventario',
        'categorias',
        'compras',
        'clientes',
        'historial/ventas',
        'pedidos',
        'caja',
        'configuracion',
        'egresos',
        'ingresos',
        'reportes',
        'notificaciones',
        'asistente',
        'promociones',
        'movimientos-stock',
        'movimientos',
        'turnos',
        'sucursales',
      ];
      const users = await this.usersModel.find();
      const updatePromises = users.map((user) => {
        user.routesAllowed = [...DEFAULT_ROUTES_ALLOWED]; // Habilitar todas las rutas
        return user.save();
      });
      await Promise.all(updatePromises);
      return {
        success: true,
        message: 'Todas las rutas habilitadas para todos los usuarios',
      };
    } catch (error) {
      throw error;
    }
  }

  //Verificar si el email del usuario está verificado
  async checkIfEmailVerified(userId: string) {
    try {
      if (!userId) {
        throw new NotFoundException('ID no encontrado');
      }
      const user = await this.usersModel.findById({ _id: userId });
      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado',
        };
      }
      return {
        success: true,
        message: 'Usuario encontrado',
        isEmailVerified: user.isEmailVerified,
      };
    } catch (error) {
      throw error;
    }
  }

  //Obtener dato del usuario solamente lo que se necesite para el front
  // Obtener campos específicos de un usuario
  async getUserFields(id: string, fields: string[]) {
    try {
      if (!id) {
        throw new NotFoundException('ID no encontrado');
      }

      // Convertimos el array en un string para .select(), ejemplo: ['email','username'] -> 'email username'
      const fieldsString = fields.join(' ');

      const user = await this.usersModel.findById(id).select(fieldsString);

      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado',
        };
      }

      return {
        success: true,
        message: 'Usuario encontrado',
        user,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
