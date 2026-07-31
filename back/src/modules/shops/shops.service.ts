import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Shops } from './shops.schema';
import mongoose, { Model } from 'mongoose';
import { CreateShopDto, UpdateShopDto } from './dto/shops.dto';
import { EmailsService } from '../emails/emails.service';
import { Users } from '../users/users.schema';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ShopsService {
  private readonly logger = new Logger(ShopsService.name);

  constructor(
    @InjectModel(Shops.name) private shopsModel: Model<Shops>,
    @InjectModel(Users.name) private usersModel: Model<Users>,
    private emailService: EmailsService,
  ) {}

  //Crear un negocio
  async createShop(body: CreateShopDto) {
    try {
      const emailExists = await this.shopsModel.findOne({
        email: body.email,
      });

      if (emailExists) {
        return {
          success: false,
          message: 'El correo ya esta registrado en otro negocio',
        };
      }

      const shop = await this.shopsModel.create(body);

      if (!shop) {
        return {
          success: false,
          message: 'Error al crear el negocio',
        };
      }

      // Enviar correo de bienvenida

      await this.emailService.sendWelcomeEmail(
        body.email,
        body.name,
        body.email,
      );

      return {
        success: true,
        message: 'Negocio creado correctamente',
        data: shop,
      };
    } catch (error) {
      throw error;
    }
  }

  //Traer todos los negocios con paginacion
  async getAllShops(page: number, limit: number) {
    try {
      const pageNumber = Number(page);
      const pageLimit = Number(limit);

      const skip = (pageNumber - 1) * pageLimit;
      const shops = await this.shopsModel
        .find()
        .skip(skip)
        .limit(pageLimit)
        .sort({ createdAt: -1 });

      if (!shops || shops.length === 0) {
        return {
          success: false,
          message: 'No se encontraron negocios',
        };
      }

      const total = await this.shopsModel.countDocuments();

      return {
        success: true,
        message: 'Negocios encontrados',
        data: shops,
        pagination: {
          total: total,
          page: pageNumber,
          limit: pageLimit,
          totalPages: Math.ceil(total / pageLimit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  //Traer un negocio por id
  async getShopById(id: string) {
    try {
      if (!id) {
        throw new NotFoundException('Id no encontrado');
      }
      const shop = await this.shopsModel.findById(id);
      if (!shop) {
        throw new NotFoundException('No se encontró el negocio');
      }
      return {
        success: true,
        message: 'Negocio encontrado',
        data: shop,
      };
    } catch (error) {
      throw error;
    }
  }

  //Actualizar un negocio por id
  async updateShop(id: string, body: UpdateShopDto) {
    try {
      if (!id) {
        throw new NotFoundException('Id no encontrado');
      }
      const shop = await this.shopsModel.findByIdAndUpdate(
        id,
        { ...body, isFirstLogin: false },
        {
          new: true,
        },
      );
      if (!shop) {
        throw new NotFoundException('No se encontró el negocio');
      }
      return {
        success: true,
        message: 'Negocio actualizado correctamente',
        data: shop,
      };
    } catch (error) {
      throw error;
    }
  }

  //?Eliminar un negocio por id
  async deleteShop(id: string) {
    try {
      if (!id) {
        throw new NotFoundException('Id no encontrado');
      }
      const shop = await this.shopsModel.findByIdAndDelete(id);
      if (!shop) {
        throw new NotFoundException('No se encontró el negocio');
      }
      return {
        success: true,
        message: 'Negocio eliminado correctamente',
      };
    } catch (error) {
      throw error;
    }
  }

  //Verificar si el negocio ya tiene telefono registrado
  async checkShopPhone(shopId: string) {
    try {
      if (!shopId) {
        throw new NotFoundException('Id no encontrado');
      }

      const shop = await this.shopsModel.findById(shopId);

      if (!shop) {
        throw new NotFoundException('No se encontró el negocio');
      }
      if (!shop.phone) {
        return {
          success: false,
        };
      } else {
        return {
          success: true,
        };
      }
    } catch (error) {
      throw error;
    }
  }

  //?
  // ####
  // SOLO DEV
  //###
  //?

  //Actualizar plan de todos los negocios
  async updateAllShopsPlan() {
    try {
      const shops: any = await this.shopsModel.find();
      const updatedShops = shops.map((shop) => {
        shop.plan = 'MEDIUM';
        return shop.save();
      });
      await Promise.all(updatedShops);
      return {
        success: true,
        message: 'Planes de todos los negocios actualizados correctamente',
      };
    } catch (error) {
      throw error;
    }
  }

  // Cron para eliminar negocios y usuarios que no hayan tenido login en los últimos 15 días
  @Cron('0 12 * * *', { timeZone: 'America/Argentina/Buenos_Aires' })
  async deleteInactiveShops() {
    try {
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

      // Buscar shops que no tuvieron ningún usuario con login en los últimos 15 días
      // Un shop se considera inactivo si NINGUNO de sus usuarios (isMainUser=true o cualquiera)
      // tiene lastLogin posterior a los 15 días atrás
      const allShops = await this.shopsModel.find({}).select('_id').lean();

      const inactiveShopIds: any[] = [];

      for (const shop of allShops) {
        const activeUser = await this.usersModel.findOne({
          shopId: shop._id,
          lastLogin: { $gte: fifteenDaysAgo },
        });
        if (!activeUser) {
          inactiveShopIds.push(shop._id);
        }
      }

      if (inactiveShopIds.length === 0) {
        return {
          success: true,
          message: 'No se encontraron negocios inactivos',
        };
      }

      // Eliminar usuarios de esos negocios
      const userDeletion = await this.usersModel.deleteMany({
        shopId: { $in: inactiveShopIds },
      });

      // Eliminar los negocios inactivos
      const shopDeletion = await this.shopsModel.deleteMany({
        _id: { $in: inactiveShopIds },
      });

      return {
        success: true,
        message: `Se eliminaron ${shopDeletion.deletedCount} negocios y ${userDeletion.deletedCount} usuarios por inactividad de 15 días.`,
        details: {
          totalShopsDeleted: shopDeletion.deletedCount,
          totalUsersDeleted: userDeletion.deletedCount,
        },
      };
    } catch (error) {
      this.logger.error('Error al eliminar negocios inactivos:', error);
      throw new Error('Error al eliminar negocios inactivos');
    }
  }
}
