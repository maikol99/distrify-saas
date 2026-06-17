/* eslint-disable */
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Clients } from './clients.schema';
import { CreateClientDto } from './dto/clients.dto';
import { Pedidos } from '../pedidos/pedidos.schema';
import { Sales } from '../sales/sales.schema';
import { ClientPayments } from '../client-payments/client-payments.schema';

@Injectable()
export class ClientsService {
  constructor(
    @InjectModel(Clients.name) private clientsModel: Model<Clients>,
    @InjectModel(Pedidos.name) private pedidosModel: Model<Pedidos>,
    @InjectModel(Sales.name) private salesModel: Model<Sales>,
    @InjectModel(ClientPayments.name)
    private clientPaymentsModel: Model<ClientPayments>,
  ) {}

  // CREAR NUEVO CLIENTE
  async create(body: CreateClientDto) {
    try {
      if (!body.shopId) {
        throw new BadRequestException('shopId is required');
      }

      const client = await this.clientsModel.create(body);

      if (!client) {
        throw new InternalServerErrorException();
      }

      return {
        success: true,
        message: 'Cliente creado correctamente',
        data: client,
      };
    } catch (error) {
      throw error;
    }
  }

  // TRAER TODOS LOS CLIENTES
  async findAll(
    shopId: string,
    page?: number,
    limit?: number,
    minDebt?: number,
    maxDebt?: number,
    hasDebt?: string,
    typeOfClient?: string,
    isAuthorized?: string,
    clientList?: string,
  ) {
    try {
      if (!shopId) {
        throw new BadRequestException('shopId is required');
      }

      const filter: any = { shopId };

      if (minDebt !== undefined || maxDebt !== undefined) {
        filter.debt = {};
        if (minDebt) filter.debt.$gte = minDebt;
        if (maxDebt) filter.debt.$lte = maxDebt;
      }

      if (hasDebt === 'true') {
        filter.debt = { $gt: 0 };
      } else if (hasDebt === 'false') {
        filter.debt = { $lte: 0 };
      }

      if (typeOfClient) filter.typeOfClient = typeOfClient;
      if (isAuthorized) filter.isAuthorized = isAuthorized;
      if (clientList) filter.clientList = clientList;

      if (page && limit) {
        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        const skip = (pageNumber - 1) * limitNumber;

        // 💡 Contar todos los clientes (sin paginar) para calcular totalPages
        const totalClients = await this.clientsModel.countDocuments(filter);

        const clients = await this.clientsModel
          .find(filter)
          .skip(skip)
          .limit(limitNumber)
          .sort({ createdAt: -1 });

        if (clients.length === 0) {
          throw new NotFoundException('No clients found');
        }

        return {
          success: true,
          message: 'Clientes encontrados',
          data: clients,
          pagination: {
            page: pageNumber,
            limit: limitNumber,
            total: totalClients, // total real
            totalPages: Math.ceil(totalClients / limitNumber),
          },
        };
      } else {
        const clients = await this.clientsModel.find(filter);

        if (clients.length === 0) {
          throw new NotFoundException('No clients found');
        }

        return {
          success: true,
          message: 'Clientes encontrados',
          data: clients,
        };
      }
    } catch (error) {
      throw new InternalServerErrorException('Error fetching clients');
    }
  }

  // TRAER CLIENTE POR ID
  async findOne(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('id is required');
      }
      const client = await this.clientsModel.findById(id);

      if (!client) {
        throw new NotFoundException();
      }

      return {
        success: true,
        message: 'Cliente encontrado',
        data: client,
      };
    } catch (error) {
      if (error.kind === 'ObjectId') {
        throw new BadRequestException('Invalid ID format');
      }
      throw new InternalServerErrorException('Error fetching client');
    }
  }

  // TRAER CLIENTE POR USERNAME
  async findByUsername(userName: string) {
    try {
      if (!userName) {
        throw new BadRequestException('userName is required');
      }
      const regex = new RegExp(userName, 'i');

      const client = await this.clientsModel.findOne({ userName: regex });

      if (!client) {
        throw new NotFoundException();
      }

      return {
        success: true,
        message: 'Cliente encontrado',
        data: client,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error fetching client');
    }
  }

  // ACTUALIZAR UN CLIENTE
  async update(id: string, body) {
    try {
      if (!id) {
        throw new BadRequestException('id is required');
      }

      const client = await this.clientsModel.findByIdAndUpdate(id, body, {
        new: true,
      });

      if (!client) {
        throw new NotFoundException();
      }

      return {
        success: true,
        message: 'Cliente actualizado correctamente',
        data: client,
      };
    } catch (error) {
      if (error.kind === 'ObjectId') {
        throw new BadRequestException('Invalid ID format');
      }
      throw new InternalServerErrorException('Error updating client');
    }
  }

  // ELIMINAR UN CLIENTE
  async remove(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('id is required');
      }
      const client = await this.clientsModel.findByIdAndDelete(id);

      if (!client) {
        throw new NotFoundException();
      }

      return {
        success: true,
        message: 'Cliente eliminado correctamente',
      };
    } catch (error) {
      throw error;
    }
  }

  //AGREGAR UNA VENTA A UN CLIENTE
  async addSaleToClient(body) {
    try {
      if (!body.clientId || !body.saleId || !body.total) {
        throw new BadRequestException(
          'clientId, saleId and total are required',
        );
      }
      const { clientId, saleId, total } = body;
      const client = await this.clientsModel.findById(clientId);

      if (!client) {
        throw new NotFoundException('Client not found');
      }

      client.debt = client.debt + total;

      await client.save();

      return {
        success: true,
        message: 'Venta agregada correctamente al cliente',
        data: client,
      };
    } catch (error) {
      throw error;
    }
  }

  //AGREGAR UN PEDIDO A UN CLIENTE
  async addPedidoToClient(body) {
    try {
      if (!body.clientId || !body.pedidoId) {
        throw new BadRequestException('clientId and pedidoId are required');
      }
      const { clientId, pedidoId } = body;
      const client = await this.clientsModel.findById(clientId);
      if (!client) {
        throw new NotFoundException('Client not found');
      }
      await client.save();

      return {
        success: true,
        message: 'Pedido agregado correctamente al cliente',
        data: client,
      };
    } catch (error) {
      throw error;
    }
  }

  //REGISTRAR UN PAGO
  async registerPayment(clientId: string, body) {
    try {
      if (!clientId || !body.amount) {
        throw new BadRequestException('clientId and amount are required');
      }
      const client = await this.clientsModel.findById(clientId);
      if (!client) {
        throw new NotFoundException('Client not found');
      }

      if (client.debt < body.amount && body.amount <= 0 && client.debt <= 0) {
        return {
          success: false,
          message:
            'El monto del pago no puede ser mayor a la deuda del cliente',
        };
      }
      client.debt -= body.amount;
      client.payments.push(body);
      await client.save();

      return {
        success: true,
        message: 'Pago registrado correctamente',
        data: client,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error registering payment');
    }
  }

  //BUSCAR CLIENTES POR NOMBRE
  async searchClients(shopId: string, query: string) {
    try {
      if (!shopId || !query) {
        throw new BadRequestException('shopId and query are required');
      }

      const clients = await this.clientsModel.find({
        shopId,
        name: { $regex: query, $options: 'i' },
      });

      return {
        success: true,
        message: 'Clientes encontrados',
        data: clients,
      };
    } catch (error) {
      throw error;
    }
  }

  //Traer clientes completos
  async getCompleteClient(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('id is required');
      }

      const client = await this.clientsModel.findById(id);
      if (!client) {
        return {
          success: false,
          message: 'Cliente no encontrado',
        };
      }

      const payments = await this.clientPaymentsModel.find({ clientId: id });
      if (!payments) {
        return {
          success: false,
          message: 'No payments found for this client',
        };
      }

      const sales = await this.salesModel.find({ clientId: id }).populate({
        path: 'productDetails.productId',
        select: 'name sellPrice',
      });
      if (!sales) {
        return {
          success: false,
          message: 'No sales found for this client',
        };
      }

      const pedidos = await this.pedidosModel.find({ clientId: id }).populate({
        path: 'productDetails.productId',
        select: 'name sellPrice',
      });
      if (!pedidos) {
        return {
          success: false,
          message: 'No pedidos found for this client',
        };
      }

      return {
        success: true,
        message: 'Cliente encontrado',
        data: {
          client,
          sales,
          pedidos,
          payments,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
