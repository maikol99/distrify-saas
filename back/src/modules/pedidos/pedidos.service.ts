import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Clients } from '../clients/clients.schema';
import { Pedidos } from 'src/modules/pedidos/pedidos.schema';
import { Sales } from 'src/modules/sales/sales.schema';
import { Products } from '../products/products.schema';
import { CreatePedidoDto } from './dto/pedidos.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { PedidosPaymentEnum, PedidosStatusEnum, PedidoTypeEnum } from './enum/pedidos.enum';
import * as moment from 'moment-timezone'


@Injectable()
export class PedidosService {
  constructor(
    @InjectModel(Pedidos.name) private pedidosModel: Model<Pedidos>,
    private notificationsService: NotificationsService,
  ) { }

  //Crear un pedido
  async createPedido(body: CreatePedidoDto) {
    try {
      const pedido = await this.pedidosModel.create(body);
      if (!pedido) {
        return {
          success: false,
          message: 'Error creando el pedido',
        };
      }

      await this.notificationsService.create({
        shopId: body.shopId,
        type: 'ORDER_PLACED',
        status: 'UNREAD',
        title: 'Nuevo pedido creado',
        message: `Se ha creado un nuevo pedido para la tienda por un total de ${body.total}`,
      });

      return {
        success: true,
        message: 'Pedido creado correctamente',
        pedido,
      };
    } catch (error) {
      throw error;
    }
  }

  //Traer pedidos de negocio con paginacion
  async getPedidosNegocio(shopId: string, page: number, limit: number) {
    try {
      let pageNumber = Number(page);
      let limitNumber = Number(limit);

      let skip = (pageNumber - 1) * limitNumber;

      const pedidos = await this.pedidosModel
        .find({ shopId })
        .skip(skip)
        .limit(limitNumber)
        .sort({ createdAt: -1 });

      if (!pedidos || pedidos.length === 0) {
        throw new NotFoundException(
          'No se encontraron pedidos para este negocio',
        );
      }

      const total = await this.pedidosModel.countDocuments({ shopId });
      const totalPages = Math.ceil(total / limitNumber);

      return {
        success: true,
        pedidos,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtener un pedido por ID
  async getPedidoById(id: string) {
    const pedido = await this.pedidosModel.findById(id).populate({
      path: 'productDetails.productId',
      select: 'name sellPrice',
    });

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    return {
      success: true,
      pedido,
    };
  }

  // Actualizar un pedido
  async updatePedido(id: string, body: Partial<CreatePedidoDto>) {
    const pedido = await this.pedidosModel.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado para actualizar');
    }

    return {
      success: true,
      message: 'Pedido actualizado correctamente',
      pedido,
    };
  }

  // Eliminar un pedido
  async deletePedido(id: string) {
    const pedido = await this.pedidosModel.findByIdAndDelete(id);

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado para eliminar');
    }

    return {
      success: true,
      message: 'Pedido eliminado correctamente',
    };
  }


  //Filtrar pedidos con paginacion
  async filterPedidos(
    shopId: string,
    page: number,
    limit: number,
    startDate?: string,
    endDate?: string,
    deliveryType?: PedidoTypeEnum,
    status?: PedidosStatusEnum,
    paymentStatus?: PedidosPaymentEnum,
    paymentType?: PedidosPaymentEnum,
  ) {
    try {
      let pageNumber = Number(page);
      let limitNumber = Number(limit);
      let skip = (pageNumber - 1) * limitNumber;

      const filter: any = { shopId };

      if (startDate && endDate) {
        const start = moment.tz(startDate, 'America/Argentina/Buenos_Aires').startOf('day').toDate();
        const end = moment.tz(endDate, 'America/Argentina/Buenos_Aires').endOf('day').toDate();
        filter.createdAt = { $gte: start, $lte: end };
      }

      if (deliveryType) {
        filter.deliveryType = deliveryType;
      }

      if (status) {
        filter.status = status;
      }

      if (paymentStatus) {
        filter.paymentStatus = paymentStatus;
      }

      if (paymentType) {
        filter.paymentType = paymentType;
      }

      const pedidos = await this.pedidosModel
        .find(filter)
        .skip(skip)
        .limit(limitNumber)
        .sort({ createdAt: -1 });

      if (!pedidos || pedidos.length === 0) {
        return {
          success: false,
          message: 'No se encontraron pedidos con los filtros aplicados',
        }
      }

      const total = await this.pedidosModel.countDocuments(filter);
      const totalPages = Math.ceil(total / limitNumber);

      return {
        success: true,
        pedidos,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages,
        },
      };
    } catch (error) {
      throw error
    }
  }
}
