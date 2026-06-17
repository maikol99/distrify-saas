import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Buys } from './buys.schema';
import * as fs from 'fs';
import * as path from 'path';
import { Suppliers } from '../suppliers/supplier.schema';
import * as moment from 'moment-timezone';
import { CreateBuyDto } from './dto/buys.dto';
import { Products } from '../products/products.schema';

@Injectable()
export class BuysService {
  private readonly logger = new Logger(BuysService.name);

  constructor(
    @InjectModel(Buys.name) private buysModel: Model<Buys>,
    @InjectModel(Products.name) private productsModel: Model<Products>,
    @InjectModel(Suppliers.name) private supplierModel: Model<Suppliers>,
  ) {}

  async create(body: CreateBuyDto) {
    const session = await this.buysModel.startSession();
    session.startTransaction();
    try {
      const buy = await this.buysModel.create([body], { session });
      if (!buy) {
        throw new InternalServerErrorException('Error creando la compra');
      }

      //Actualizar deuda del proveedor si la compra no está pagada
      if (body.supplierId && body.isPaid === false) {
        const supplier = await this.supplierModel.findById(body.supplierId);
        if (!supplier) {
          throw new NotFoundException('Supplier not found');
        }

        supplier.debt += body.total;

        await supplier.save({ session });
      }

      //Actualizar productos si se cargaron
      this.logger.log('Verificando si hay productos para actualizar...');

      if (body.productsAdded && body.products.length > 0) {
        this.logger.log('Actualizando productos en inventario...');

        for (const item of body.products) {
          const product = await this.productsModel.findById(item.productId);
          if (!product) {
            throw new NotFoundException('Product not found');
          }

          product.quantity += item.quantity;
          await product.save({ session });
        }
      }

      await session.commitTransaction();
      session.endSession();

      return {
        success: true,
        message: 'Compra creada correctamente',
        data: buy,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  // TRAER TODAS LAS COMPRAS
  async findAll(shopId: string, page: number, limit: number) {
    try {
      if (!shopId) {
        throw new InternalServerErrorException(
          'shopId es un campo requerido y debe tener un valor válido.',
        );
      }

      if (page && limit) {
        let pageNumber = Number(page);
        let limitNumber = Number(limit);
        const skip = (pageNumber - 1) * limitNumber;

        const buys = await this.buysModel
          .find({ shopId })
          .skip(skip)
          .limit(limitNumber)
          .populate('supplierId', 'name')
          .sort({ createdAt: -1 });
        const total = await this.buysModel.countDocuments({ shopId });

        if (buys.length === 0) {
          return {
            success: false,
            message: 'No se encontraron compras para esta tienda',
          };
        }
        return {
          success: true,
          data: buys,
          pagination: {
            total: total,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(total / limitNumber),
          },
        };
      }
    } catch (error) {
      throw error;
    }
  }

  // TRAER COMPRA POR ID
  async findOne(id: string) {
    try {
      const buy = await this.buysModel.findById(id).populate({
        path: 'products.productId',
        select: 'name',
      });

      if (!buy) {
        throw new NotFoundException();
      }

      return {
        success: true,
        message: 'Compra encontrada correctamente',
        data: buy,
      };
    } catch (error) {
      if (error.kind === 'ObjectId') {
        throw new BadRequestException('Invalid ID format');
      }
      throw new InternalServerErrorException('Error fetching buy');
    }
  }

  // ACTUALIZAR UNA COMPRA
  async update(id: string, body) {
    const session = await this.buysModel.startSession();

    try {
      session.startTransaction();

      if (body.productsAdded) {
        const buy = await this.buysModel.findById(id);
        if (!buy) {
          throw new NotFoundException('Compra no encontrada');
        }
        //Actualizar productos si se cargaron
        if (body.products && body.products.length > 0) {
          for (const item of body.products) {
            const product = await this.productsModel.findById(item.productId);
            if (!product) {
              throw new NotFoundException('Product not found');
            }

            product.quantity += item.quantity;
            await product.save({ session });
          }
        }
      }

      const updatedBuy = await this.buysModel.findByIdAndUpdate(id, body, {
        new: true,
        session,
      });

      if (!updatedBuy) {
        throw new NotFoundException();
      }

      await session.commitTransaction();
      session.endSession();

      return {
        success: true,
        message: 'Compra actualizada correctamente',
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  // ELIMINAR UNA COMPRA
  async remove(id: string) {
    try {
      const buy = await this.buysModel.findByIdAndDelete(id);

      if (!buy) {
        throw new NotFoundException();
      }

      return {
        success: true,
        message: 'Compra eliminada correctamente',
      };
    } catch (error) {
      if (error.kind === 'ObjectId') {
        throw new BadRequestException('Invalid ID format');
      }
      throw new InternalServerErrorException('Error deleting buy');
    }
  }

  async updateImage(
    id: string,
    imageIndex: number,
    newImage: Express.Multer.File,
  ) {
    try {
      this.logger.log(
        `Iniciando actualización de imagen para compra ${id}, índice ${imageIndex}`,
      );

      // Primero, obtener la compra actual
      const buy = await this.buysModel.findById(id);

      if (!buy) {
        this.logger.error(`Compra con ID ${id} no encontrada`);
        throw new NotFoundException('Compra no encontrada');
      }

      // Verificar que el índice sea válido
      if (
        !buy.imagesArray ||
        imageIndex < 0 ||
        imageIndex >= buy.imagesArray.length
      ) {
        this.logger.error(`Índice de imagen ${imageIndex} fuera de rango`);
        throw new BadRequestException('Índice de imagen no válido');
      }

      // Guardar la nueva imagen
      const imageUrl = `/uploads/${newImage.filename}`;
      this.logger.log(`Nueva imagen guardada: ${imageUrl}`);

      // Obtener la ruta de la imagen anterior para posible eliminación del archivo
      const oldImagePath = buy.imagesArray[imageIndex];

      // Actualizar la imagen en el array
      const updatedImagesArray = [...buy.imagesArray];
      updatedImagesArray[imageIndex] = imageUrl;

      // Si estamos actualizando la imagen principal (índice 0), actualizar también el campo imagen
      const updateData: any = { imagesArray: updatedImagesArray };
      if (imageIndex === 0) {
        updateData.imagen = imageUrl;
      }

      // Actualizar el documento en la base de datos
      const updatedBuy = await this.buysModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true },
      );

      if (!updatedBuy) {
        this.logger.error('Error al actualizar la imagen en la base de datos');
        throw new InternalServerErrorException('Error actualizando la imagen');
      }

      this.logger.log('Imagen actualizada exitosamente');

      this.deleteImageFile(oldImagePath);

      return updatedBuy;
    } catch (error) {
      this.logger.error('Error durante la actualización de la imagen:', {
        message: error.message,
        stack: error.stack,
        id,
        imageIndex,
      });

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Error actualizando la imagen');
    }
  }

  // Método auxiliar para eliminar archivos físicos (opcional)
  private deleteImageFile(filePath: string): void {
    try {
      // Eliminar el prefijo '/uploads/' para obtener el nombre de archivo
      const fileName = filePath.replace('/uploads/', '');
      const fullPath = path.join(process.cwd(), 'uploads', fileName);

      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        this.logger.log(`Archivo eliminado: ${fullPath}`);
      } else {
        this.logger.log(`El archivo no existe: ${fullPath}`);
      }
    } catch (error) {
      this.logger.error(`Error al eliminar el archivo ${filePath}:`, error);
    }
  }

  //Buscar compras por proveedor
  async findBySupplier(supplierName: string, shopId: string) {
    try {
      this.logger.log('Buscando compras por proveedor:', supplierName);

      const supplier = await this.supplierModel.findOne({
        name: { $regex: new RegExp(supplierName, 'i') },
      });

      if (!supplier) {
        return {
          success: false,
          message: 'Proveedor no encontrado',
        };
      }

      const buys = await this.buysModel
        .find({
          supplierId: '6878120827f510480f2040e5',
          shopId: shopId,
        })
        .sort({ createdAt: -1 });

      if (buys.length === 0) {
        return {
          success: false,
          message: 'No se encontraron compras para este proveedor',
        };
      }

      return {
        success: true,
        data: buys,
      };
    } catch (error) {
      throw error;
    }
  }

  //Filtrar compras
  async filterBuys(
    shopId: string,
    page: number,
    limit: number,
    supplierId: string,
    startDate: Date,
    endDate: Date,
    category: string,
    paymentMethod: string,
    minAmount?: number,
    maxAmount?: number,
    isPaid?: string,
  ) {
    try {
      if (!shopId) {
        return {
          success: false,
          message: 'ID de tienda es requerido',
        };
      }
      let pageNumber = Number(page);
      let limitNumber = Number(limit);
      let skip = (pageNumber - 1) * limitNumber;

      let filter: any = { shopId };

      if (startDate && endDate) {
        const start = moment
          .tz(startDate, 'America/Argentina/Buenos_Aires')
          .startOf('day')
          .toDate();
        const end = moment
          .tz(endDate, 'America/Argentina/Buenos_Aires')
          .endOf('day')
          .toDate();

        filter.createdAt = { $gte: start, $lte: end };
      }

      if (category) {
        filter.category = category;
      }

      if (supplierId) {
        filter.supplierId = supplierId;
      }

      if (paymentMethod) {
        filter.paymentMethod = paymentMethod;
      }

      if (minAmount !== undefined || maxAmount !== undefined) { filter.total = {}; if (minAmount) filter.total.$gte = minAmount; if (maxAmount) filter.total.$lte = maxAmount; }
      if (isPaid === 'true') filter.isPaid = true; else if (isPaid === 'false') filter.isPaid = { $ne: true };

      const buys = await this.buysModel
        .find(filter)
        .skip(skip)
        .limit(limitNumber)
        .sort({ createdAt: -1 });

      if (buys.length === 0) {
        return {
          success: false,
          message: 'No se encontraron compras',
        };
      }

      const total = await this.buysModel.countDocuments(filter);

      return {
        success: true,
        data: buys,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          pages: Math.ceil(total / limitNumber),
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
