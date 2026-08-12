import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Products } from './products.schema';
import { v2 as cloudinary, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');
import { ConfigService } from '@nestjs/config';
import { CreateProductDto } from './dto/products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ProductRangeEnum,
  ProductUpdateActionEnum,
  ProductUpdateTypeEnum,
} from './product.enum';
import { PlanLimitsService } from '../plan-limits/plan-limits.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectModel(Products.name) private productsModel: Model<Products>,
    private configService: ConfigService,
    private planLimitsService: PlanLimitsService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  //Crear un nuevo producto
  async create(body: CreateProductDto) {
    try {
      if (!body.shopId) {
        throw new BadRequestException('shopId no definido');
      }
      if (typeof body.shopId === 'string' && Types.ObjectId.isValid(body.shopId)) {
        (body as any).shopId = new Types.ObjectId(body.shopId);
      }
      if (typeof body.categoryId === 'string' && Types.ObjectId.isValid(body.categoryId)) {
        (body as any).categoryId = new Types.ObjectId(body.categoryId);
      }
      // Verificar límite de productos según plan
      await this.planLimitsService.checkProductLimit(body.shopId as any);
      const product = await this.productsModel.create(body);
      if (!product) {
        throw new InternalServerErrorException('Error creating product');
      }
      return {
        success: true,
        message: 'Producto creado con exito',
        data: product,
      };
    } catch (error) {
      throw error;
    }
  }

  //Traer todos los producto
  async findAll(
    shopId: string,
    page?: number,
    limit?: number,
    search?: string,
    location?: string,
    stockLevel?: string,
    minPrice?: number,
    maxPrice?: number,
    minBuyPrice?: number,
    maxBuyPrice?: number,
    expirationFrom?: string,
    expirationTo?: string,
    createdFrom?: string,
    createdTo?: string,
    minStock?: number,
    maxStock?: number,
  ) {
    try {
      // Construir el filtro base
      const filter: any = {
        shopId: Types.ObjectId.isValid(shopId)
          ? { $in: [shopId, new Types.ObjectId(shopId)] }
          : shopId,
      };

      // Agregar filtro de búsqueda si se proporciona
      if (search && search.trim()) {
        filter.$or = [
          { name: { $regex: search.trim(), $options: 'i' } },
          { code: { $regex: search.trim(), $options: 'i' } },
          { description: { $regex: search.trim(), $options: 'i' } },
        ];
      }

      // Filtro por ubicación de stock
      if (location === 'local') {
        filter.quantity = { $gt: 0 };
      } else if (location === 'depot') {
        filter.depotStock = { $gt: 0 };
      }

      // Filtro por nivel de stock
      if (stockLevel === 'low') {
        filter.$expr = { $and: [
          { $gt: ['$minQuantity', 0] },
          { $lte: ['$quantity', '$minQuantity'] },
        ] };
      } else if (stockLevel === 'out') {
        filter.quantity = { $lte: 0 };
      } else if (stockLevel === 'in') {
        filter.quantity = { $gt: 0 };
      }

      // Filtro por rango de precio de venta
      if (minPrice !== undefined || maxPrice !== undefined) {
        filter.sellPrice = {};
        if (minPrice !== undefined) filter.sellPrice.$gte = Number(minPrice);
        if (maxPrice !== undefined) filter.sellPrice.$lte = Number(maxPrice);
      }

      // Filtro por rango de precio de compra
      if (minBuyPrice !== undefined || maxBuyPrice !== undefined) {
        filter.buyPrice = {};
        if (minBuyPrice !== undefined) filter.buyPrice.$gte = Number(minBuyPrice);
        if (maxBuyPrice !== undefined) filter.buyPrice.$lte = Number(maxBuyPrice);
      }

      // Filtro por rango de vencimiento
      if (expirationFrom || expirationTo) {
        filter.expirationDate = {};
        if (expirationFrom) filter.expirationDate.$gte = new Date(expirationFrom);
        if (expirationTo) filter.expirationDate.$lte = new Date(expirationTo);
      }

      // Filtro por rango de creación
      if (createdFrom || createdTo) {
        filter.createdAt = {};
        if (createdFrom) filter.createdAt.$gte = new Date(createdFrom);
        if (createdTo) filter.createdAt.$lte = new Date(createdTo);
      }

      if (minStock !== undefined || maxStock !== undefined) {
        filter.quantity = {};
        if (minStock !== undefined) filter.quantity.$gte = Number(minStock);
        if (maxStock !== undefined) filter.quantity.$lte = Number(maxStock);
      }

      if (!page && !limit) {
        const products = await this.productsModel
          .find(filter)
          .populate({ path: 'categoryId', select: 'name description' })
          .sort({ name: 1 })
          .lean();

        return {
          success: true,
          message: 'Productos encontrados',
          products,
        };
      }

      const numberPage = Number(page) || 1;
      const numberLimit = Number(limit) || 10;
      const skip = (numberPage - 1) * numberLimit;

      const products = await this.productsModel
        .find(filter)
        .populate({ path: 'categoryId', select: 'name description' })
        .skip(skip)
        .limit(numberLimit)
        .sort({ name: 1 })
        .lean();

      const total = await this.productsModel.countDocuments(filter);

      if (products.length === 0) {
        return {
          success: false,
          message: 'No se encontraron productos',
        };
      }

      return {
        success: true,
        message: 'Productos encontrados',
        products,
        pagination: {
          total: total,
          limit: numberLimit,
          page: numberPage,
          totalPages: Math.ceil(total / numberLimit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  //Traer producot por id
  async findOne(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('id no definido');
      }
      const product = await this.productsModel.findById(id);

      if (!product) {
        throw new NotFoundException();
      }

      return {
        success: true,
        message: 'Producto encontrado',
        data: product,
      };
    } catch (error) {
      throw error;
    }
  }

  //Actualizar producto
  async update(id: string, body: UpdateProductDto) {
    try {
      const productWithoutUpdate = await this.productsModel.findById(id);

      if (!productWithoutUpdate) {
        throw new NotFoundException('Producto no encontrado');
      }

      if (
        productWithoutUpdate.sellPrice !== body.sellPrice ||
        productWithoutUpdate.buyPrice !== body.buyPrice
      ) {
        body.updatedDate = new Date();

        if (
          body.buyPrice !== undefined &&
          body.buyPrice !== productWithoutUpdate.buyPrice
        ) {
          body.priceLists = productWithoutUpdate.priceLists.map((list) => {
            list.buyPrice = body.buyPrice;
            list.price = this.calculateSellPrice(
              body.buyPrice,
              list.utility,
              list.iva,
            );
            return list;
          });
        }
      }

      const updatedProduct = await this.productsModel.findByIdAndUpdate(
        { _id: id },
        { $set: body },
        { new: true },
      );

      if (!updatedProduct) {
        return {
          success: false,
          message: 'No se pudo actualizar el producto',
        };
      }

      return {
        success: true,
        message: 'Producto actualizado con exito',
        data: updatedProduct,
      };
    } catch (error) {
      this.logger.error('Error actualizando producto:', error);
      throw error;
    }
  }

  // Función para calcular el precio de venta en base al precio de compra, utilidad e IVA
  calculateSellPrice(buyPrice: number, utility: number, iva: number): number {
    const priceWithUtility = buyPrice + buyPrice * (utility / 100);
    const finalPrice = priceWithUtility + priceWithUtility * (iva / 100);
    return finalPrice;
  }

  //Eliminar producto
  async remove(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('id no definido');
      }
      const product = await this.productsModel.findByIdAndDelete(id);

      if (!product) {
        throw new NotFoundException();
      }

      return {
        success: true,
        message: 'Producto eliminado con exito',
      };
    } catch (error) {
      throw error;
    }
  }

  //Traer por nombre
  async searchProduct(
    name: string | number,
    shopId: string,
    page?: number,
    limit?: number,
  ) {
    try {
      if (!name) {
        return {
          success: false,
          message: 'Debe proporcionar un nombre para buscar',
        };
      }

      const pageNumber = Number(page) || 1;
      const limitNumber = Number(limit) || 10;
      const skip = (pageNumber - 1) * limitNumber;

      const escapedInput = String(name)
        .replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
        .toLowerCase();
      const accentInsensitiveRegex = escapedInput
        .replace(/a/g, '[aá]')
        .replace(/e/g, '[eé]')
        .replace(/i/g, '[ií]')
        .replace(/o/g, '[oó]')
        .replace(/u/g, '[uú]')
        .replace(/c/g, '[cç]');
      const regex = new RegExp(accentInsensitiveRegex, 'i');

      const shopIdFilter = Types.ObjectId.isValid(shopId)
        ? { $in: [shopId, new Types.ObjectId(shopId)] }
        : shopId;

      const searchFilter = {
        shopId: shopIdFilter,
        $or: [
          { name: regex },
          { code: regex },
          { description: regex },
        ],
      };

      const products = await this.productsModel
        .find(searchFilter)
        .populate({ path: 'categoryId', select: 'name description' })
        .skip(skip)
        .limit(limitNumber)
        .sort({ name: 1 })
        .lean();

      if (products.length === 0) {
        return { success: false, message: 'No se encontraron productos' };
      }

      const totalDocuments = await this.productsModel.countDocuments(searchFilter);

      return {
        success: true,
        message: 'Productos encontrados',
        data: products,
        pagination: {
          total: totalDocuments,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(totalDocuments / limitNumber),
        },
      };
    } catch (error) {
      this.logger.error('Error al buscar productos:', error);
      throw new InternalServerErrorException(
        'Hubo un problema al buscar el producto.',
      );
    }
  }

  //Traer por código
  async searchProductByCode(code: string | number, shopId: string) {
    try {
      if (!code) {
        return {
          success: false,
          message: 'Debe proporcionar un código para buscar',
        };
      }

      // Usar el mismo shopIdFilter que searchProduct para compatibilidad con ObjectId y string
      const shopIdFilter = Types.ObjectId.isValid(shopId)
        ? { $in: [shopId, new Types.ObjectId(shopId)] }
        : shopId;

      const codeStr = String(code).trim();
      // Intentar convertir a número para búsqueda numérica también
      const codeNum = !isNaN(Number(codeStr)) ? Number(codeStr) : null;

      const orConditions: any[] = [{ code: codeStr }];
      if (codeNum !== null) orConditions.push({ code: codeNum });

      const products = await this.productsModel
        .find({
          shopId: shopIdFilter,
          $or: orConditions,
        })
        .populate({ path: 'categoryId', select: 'name description' })
        .lean();

      if (!products || products.length === 0) {
        return {
          success: false,
          message: 'No se encontraron productos',
        };
      }

      return {
        success: true,
        message: 'Productos encontrados',
        data: products,
      };
    } catch (error) {
      this.logger.error('Error al buscar productos:', error);
      throw new InternalServerErrorException(
        'Hubo un problema al buscar el producto.',
      );
    }
  }

  //Cargar imagen de producto
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<{ secure_url: string; public_id: string }> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      });

      toStream(file.buffer).pipe(upload);
    });
  }

  //Eliminar una imagen de producto
  async deleteImage(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      v2.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }

  //Traer productos por categoria
  async getProductsByCategory(category: string, page?: number, limit?: number) {
    try {
      if (!page && !limit) {
        const products = await this.productsModel.find({ category });
        const totalDocuments = products.length;

        return {
          products,
          currentPage: 1,
          totalPages: 1,
          totalProducts: totalDocuments,
        };
      }

      const finalPage = page || 1;
      const finalLimit = limit || 10;

      if (finalPage < 1 || finalLimit < 1) {
        throw new BadRequestException(
          'Page and limit must be positive integers.',
        );
      }

      const skip = (finalPage - 1) * finalLimit;

      const products = await this.productsModel
        .find({ category })
        .skip(skip)
        .limit(finalLimit);

      const totalDocuments = await this.productsModel.countDocuments({
        category,
      });
      const totalPages = Math.ceil(totalDocuments / finalLimit);

      if (!products) {
        throw new InternalServerErrorException('No products found');
      }

      return {
        success: true,
        message: 'Productos encontrados',
        data: products,
        pagination: {
          total: totalDocuments,
          page: finalPage,
          limit: finalLimit,
          totalPages: totalPages,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  //Filtrar productos por filtros
  async filterProducts(
    shopId: string,
    page: number,
    limit: number,
    categoryId: string,
    supplierId: string,
    maxAmount: number,
    minAmount: number,
    name: string,
    location?: string,
    stockLevel?: string,
    minBuyPrice?: number,
    maxBuyPrice?: number,
    expirationFrom?: string,
    expirationTo?: string,
    minStock?: number,
    maxStock?: number,
    code?: string,
    createdFrom?: string,
    createdTo?: string,
    sortBy?: string,
    sortOrder?: string,
  ) {
    try {
      if (!shopId) {
        throw new BadRequestException('shopId no definido');
      }

      const query: any = {
        shopId: Types.ObjectId.isValid(shopId)
          ? { $in: [shopId, new Types.ObjectId(shopId)] }
          : shopId,
      };

      if (categoryId) {
        query['categoryId'] = Types.ObjectId.isValid(categoryId)
          ? { $in: [categoryId, new Types.ObjectId(categoryId)] }
          : categoryId;
      }

      if (supplierId && supplierId.trim() !== '') {
        query['supplierId'] = Types.ObjectId.isValid(supplierId)
          ? { $in: [supplierId, new Types.ObjectId(supplierId)] }
          : supplierId;
      }

      if (name && name.trim() !== '') {
        const escapedInput = name.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(escapedInput, 'i');
        query.$or = [
          { name: regex },
          { code: regex },
          { description: regex },
        ];
      }
      if (minAmount !== undefined || maxAmount !== undefined) {
        query.sellPrice = {};
        if (minAmount !== undefined) {
          query.sellPrice.$gte = minAmount;
        }
        if (maxAmount !== undefined) {
          query.sellPrice.$lte = maxAmount;
        }
      }

      if (location === 'local') {
        query.quantity = { $gt: 0 };
      } else if (location === 'depot') {
        query.depotStock = { $gt: 0 };
      }

      if (stockLevel === 'low') {
        query.$expr = { $and: [
          { $gt: ['$minQuantity', 0] },
          { $lte: ['$quantity', '$minQuantity'] },
        ] };
      } else if (stockLevel === 'out') {
        query.quantity = { $lte: 0 };
      } else if (stockLevel === 'in') {
        query.quantity = { $gt: 0 };
      }

      if (minBuyPrice !== undefined || maxBuyPrice !== undefined) {
        query.buyPrice = {};
        if (minBuyPrice !== undefined) query.buyPrice.$gte = minBuyPrice;
        if (maxBuyPrice !== undefined) query.buyPrice.$lte = maxBuyPrice;
      }

      if (expirationFrom || expirationTo) {
        query.expirationDate = {};
        if (expirationFrom) query.expirationDate.$gte = new Date(expirationFrom);
        if (expirationTo) query.expirationDate.$lte = new Date(expirationTo);
      }

      if (minStock !== undefined || maxStock !== undefined) {
        query.quantity = query.quantity || {};
        if (minStock !== undefined) query.quantity.$gte = Number(minStock);
        if (maxStock !== undefined) query.quantity.$lte = Number(maxStock);
      }

      if (createdFrom || createdTo) {
        query.createdAt = {};
        if (createdFrom) query.createdAt.$gte = new Date(createdFrom);
        if (createdTo) query.createdAt.$lte = new Date(createdTo);
      }

      const sortableFields = ['name', 'sellPrice', 'quantity', 'expirationDate', 'createdAt'];
      const sortField = sortableFields.includes(sortBy) ? sortBy : 'createdAt';
      const sortDirection = sortOrder === 'asc' ? 1 : -1;
      const sort: any = { [sortField]: sortDirection };

      let pageNumber = Number(page) || 1;
      let limitNumber = Number(limit) || 10;
      let skip = (pageNumber - 1) * limitNumber;

      this.logger.log('Query:', query);

      const products = await this.productsModel
        .find(query)
        .populate({ path: 'categoryId', select: 'name' })
        .populate({ path: 'supplierId', select: 'name' })
        .skip(skip)
        .limit(limitNumber)
        .sort(sort)
        .lean();

      if (products.length === 0) {
        return {
          success: false,
          message: 'No se encontraron productos con los filtros especificados',
        };
      }
      const totalDocuments = await this.productsModel.countDocuments(query);

      return {
        success: true,
        message: 'Productos filtrados encontrados',
        data: products,
        pagination: {
          total: totalDocuments,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(totalDocuments / limitNumber),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  //Eliminar multiples productos
  async deleteMultipleProducts(productIds: string[]) {
    try {
      const result = await this.productsModel.deleteMany({
        _id: { $in: productIds },
      });

      if (!result) {
        return {
          success: false,
          message: 'No se encontraron productos para eliminar',
        };
      }
      return {
        success: true,
        message: 'Productos eliminados correctamente',
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }

  //Actualizar precios de productos por porcentaje
  async updatePricesByPercentage(
    shopId: string,
    range: ProductRangeEnum,
    type: ProductUpdateTypeEnum,
    percentage: number,
    action: ProductUpdateActionEnum,
    categoryId?: string,
  ) {
    try {
      if (!shopId) {
        return { success: false, message: 'shopId no definido' };
      }
      if (!percentage || percentage <= 0) {
        return { success: false, message: 'El porcentaje debe ser mayor a 0' };
      }

      const query: any = { shopId };
      if (range === ProductRangeEnum.CATEGORY && categoryId) {
        query.categoryId = categoryId;
      }

      const count = await this.productsModel.countDocuments(query);
      if (count === 0) {
        return { success: false, message: 'No se encontraron productos' };
      }

      const factor =
        action === ProductUpdateActionEnum.INCREASE
          ? 1 + percentage / 100
          : 1 - percentage / 100;

      let update: any = {};
      if (type === ProductUpdateTypeEnum.SELPRICE) update.sellPrice = factor;
      if (type === ProductUpdateTypeEnum.BUYPRICE) update.buyPrice = factor;
      if (type === ProductUpdateTypeEnum.BOTH) {
        update.sellPrice = factor;
        update.buyPrice = factor;
      }

      const result = await this.productsModel.updateMany(query, {
        $mul: update,
      });

      return {
        success: true,
        message: `Se actualizaron ${result.modifiedCount} productos correctamente`,
      };
    } catch (error) {
      throw error;
    }
  }

  //Eliminar productos por categoria
  async deleteProductsByCategory(shopId: string, categoryId: string) {
    try {
      const result = await this.productsModel.deleteMany({
        shopId,
        categoryId,
      });
      if (!result) {
        return {
          success: false,
          message: 'No se encontraron productos para eliminar',
        };
      }

      const total = result.deletedCount;

      return {
        success: true,
        message: ` ${total} productos eliminados correctamente`,
      };
    } catch (error) {
      throw error;
    }
  }

  // Transferir stock entre local y depósito
  async transferStock(
    shopId: string,
    productId: string,
    from: 'local' | 'depot',
    to: 'local' | 'depot',
    quantity: number,
  ) {
    try {
      if (from === to) {
        return { success: false, message: 'Origen y destino no pueden ser iguales' };
      }
      if (!quantity || quantity <= 0) {
        return { success: false, message: 'La cantidad debe ser mayor a 0' };
      }

      const product = await this.productsModel.findOne({ _id: productId, shopId });
      if (!product) {
        return { success: false, message: 'Producto no encontrado' };
      }

      const fromField = from === 'local' ? 'quantity' : 'depotStock';
      const toField = to === 'local' ? 'quantity' : 'depotStock';
      const fromStock = from === 'local' ? product.quantity : product.depotStock;

      if (fromStock < quantity) {
        return {
          success: false,
          message: `Stock insuficiente en ${from === 'local' ? 'local' : 'depósito'}. Disponible: ${fromStock}`,
        };
      }

      const previousFrom = fromStock;
      const previousTo = to === 'local' ? product.quantity : product.depotStock;

      await this.productsModel.findByIdAndUpdate(productId, {
        $inc: { [fromField]: -quantity, [toField]: quantity },
      });

      return {
        success: true,
        message: 'Transferencia realizada correctamente',
        data: {
          from,
          to,
          quantity,
          previousFrom,
          newFrom: previousFrom - quantity,
          previousTo,
          newTo: previousTo + quantity,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtener valor total del stock
  async getStockValue(shopId: string, location?: string) {
    try {
      const filter: any = { shopId };
      const products = await this.productsModel.find(filter).select('name quantity depotStock buyPrice sellPrice category categoryId').lean();

      let totalCost = 0;
      let totalSellValue = 0;
      let totalProducts = 0;
      const byCategory: Record<string, { cost: number; sellValue: number; products: number }> = {};

      for (const product of products) {
        let stock = 0;
        if (location === 'local') stock = product.quantity || 0;
        else if (location === 'depot') stock = product.depotStock || 0;
        else stock = (product.quantity || 0) + (product.depotStock || 0);

        if (stock <= 0) continue;

        const cost = (product.buyPrice || 0) * stock;
        const sellValue = (product.sellPrice || 0) * stock;
        totalCost += cost;
        totalSellValue += sellValue;
        totalProducts++;

        const catKey = product.category || 'Sin categoría';
        if (!byCategory[catKey]) {
          byCategory[catKey] = { cost: 0, sellValue: 0, products: 0 };
        }
        byCategory[catKey].cost += cost;
        byCategory[catKey].sellValue += sellValue;
        byCategory[catKey].products++;
      }

      return {
        success: true,
        data: {
          totalCost,
          totalSellValue,
          potentialProfit: totalSellValue - totalCost,
          totalProducts,
          byCategory,
          location: location || 'all',
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Actualizar precios por monto fijo ($)
  async updatePricesByFixedAmount(
    shopId: string,
    range: ProductRangeEnum,
    type: ProductUpdateTypeEnum,
    amount: number,
    action: ProductUpdateActionEnum,
    categoryId?: string,
  ) {
    try {
      if (!shopId) {
        return { success: false, message: 'shopId no definido' };
      }
      if (!amount || amount <= 0) {
        return { success: false, message: 'El monto debe ser mayor a 0' };
      }

      const query: any = { shopId };
      if (range === ProductRangeEnum.CATEGORY && categoryId) {
        query.categoryId = categoryId;
      }

      const count = await this.productsModel.countDocuments(query);
      if (count === 0) {
        return { success: false, message: 'No se encontraron productos' };
      }

      const signedAmount = action === ProductUpdateActionEnum.INCREASE ? amount : -amount;

      let update: any = {};
      if (type === ProductUpdateTypeEnum.SELPRICE) update.sellPrice = signedAmount;
      if (type === ProductUpdateTypeEnum.BUYPRICE) update.buyPrice = signedAmount;
      if (type === ProductUpdateTypeEnum.BOTH) {
        update.sellPrice = signedAmount;
        update.buyPrice = signedAmount;
      }

      const result = await this.productsModel.updateMany(query, {
        $inc: update,
      });

      return {
        success: true,
        message: `Se actualizaron ${result.modifiedCount} productos correctamente`,
      };
    } catch (error) {
      throw error;
    }
  }
}
