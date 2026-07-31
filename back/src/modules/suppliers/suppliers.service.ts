import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Suppliers } from 'src/modules/suppliers/supplier.schema';
import { CreateSupplierDto } from './dto/suppliers.dto';
import { Buys } from '../buys/buys.schema';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectModel(Suppliers.name) private suppliersModel: Model<Suppliers>,
    @InjectModel(Buys.name) private buysModel: Model<Buys>,
  ) {}

  // CREAR NUEVO PROVEEDOR
  async create(createSupplierDto: CreateSupplierDto) {
    try {
      if (!createSupplierDto.shopId) {
        throw new BadRequestException('shopId is required');
      }

      const supplier = await this.suppliersModel.create(createSupplierDto);

      if (!supplier) {
        throw new InternalServerErrorException();
      }

      return {
        success: true,
        message: 'Proveedor creado correctamente',
        supplier: supplier,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error creating supplier');
    }
  }

  // TRAER TODOS LOS PROVEEDORES
  async findAll(shopId: string, page?: number, limit?: number): Promise<any> {
    try {
      if (!shopId) {
        throw new BadRequestException('shopId is required');
      }

      if (!page || !limit) {
        const suppliers = await this.suppliersModel.find({ shopId }).lean();
        if (suppliers.length === 0) {
          throw new NotFoundException('No suppliers found for this shopId');
        }
        return {
          success: true,
          message: 'Proveedores encontrados',
          suppliers: suppliers,
        };
      }

      let numberPage = Number(page);
      let numberLimit = Number(limit);
      const skip = (numberPage - 1) * numberLimit;

      const suppliers = await this.suppliersModel
        .find({ shopId })
        .skip(skip)
        .limit(numberLimit)
        .sort({ createdAt: -1 })
        .lean();

      const total = await this.suppliersModel.countDocuments({ shopId });

      if (suppliers.length === 0) {
        return {
          success: false,
          message: 'No se encontraron proveedores para este shopId',
        };
      }

      return {
        success: true,
        message: 'Proveedores encontrados',
        suppliers: suppliers,
        pagination: {
          total: total,
          totalPages: Math.ceil(total / numberLimit),
          page: numberPage,
          limit: numberLimit,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // TRAER PROVEEDOR POR ID
  async findOne(id: string): Promise<any> {
    try {
      if (!id) {
        throw new BadRequestException('ID is required');
      }
      const supplier = await this.suppliersModel.findById(id).lean();

      if (!supplier) {
        throw new NotFoundException();
      }

      return {
        success: true,
        message: 'Proveedor encontrado',
        supplier: supplier,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error fetching supplier');
    }
  }

  // ACTUALIZAR UN PROVEEDOR
  async update(id: string, updateSupplierDto: any) {
    try {
      if (!id) {
        throw new BadRequestException('ID is required');
      }
      const supplier = await this.suppliersModel.findByIdAndUpdate(
        id,
        updateSupplierDto,
        { new: true },
      );

      if (!supplier) {
        throw new NotFoundException();
      }

      return {
        success: true,
        message: 'Proveedor actualizado correctamente',
      };
    } catch (error) {
      throw new InternalServerErrorException('Error updating supplier');
    }
  }

  // ELIMINAR UN PROVEEDOR
  async remove(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('ID is required');
      }
      const supplier = await this.suppliersModel.findByIdAndDelete(id);

      if (!supplier) {
        throw new NotFoundException();
      }

      return {
        success: true,
        message: 'Proveedor eliminado correctamente',
      };
    } catch (error) {
      throw new InternalServerErrorException('Error deleting supplier');
    }
  }

  //Buscar proveedores por nombre
  async findByName(name: string, shopId: string): Promise<any> {
    try {
      if (!name || !shopId) {
        return {
          success: false,
          message: 'Nombre y shopId son requeridos',
        };
      }

      const suppliers = await this.suppliersModel
        .find({ name: { $regex: name, $options: 'i' }, shopId })
        .sort({ createdAt: -1 })
        .lean();

      if (suppliers.length === 0) {
        return {
          success: false,
          message: 'No se encontraron proveedores con ese nombre',
        };
      }

      return {
        success: true,
        message: 'Proveedores encontrados',
        suppliers: suppliers,
      };
    } catch (error) {
      throw error;
    }
  }

  //Obtener proveedores seleccionando solo nombre e id
  async findAllNames(shopId: string): Promise<any> {
    try {
      if (!shopId) {
        throw new BadRequestException('shopId is required');
      }

      const suppliers = await this.suppliersModel
        .find({ shopId }, { name: 1, _id: 1 })
        .sort({ createdAt: -1 })
        .lean();

      if (suppliers.length === 0) {
        return {
          success: false,
          message: 'No se encontraron proveedores para este shopId',
        };
      }

      return {
        success: true,
        message: 'Proveedores encontrados',
        suppliers: suppliers,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error fetching supplier names');
    }
  }

  //Obtener compras de un proveedor
  async getSupplierBuys(supplierId: string, page: number, limit: number): Promise<any> {
    try {
      if (!supplierId) {
        throw new BadRequestException('Supplier ID is required');
      }

      let pageNumber = Number(page) || 1;
      let limitNumber = Number(limit) || 10;

      const skip = (pageNumber - 1) * limitNumber;

      const buys = await this.buysModel
        .find({ supplierId })
        .skip(skip)
        .limit(limitNumber)
        .sort({ createdAt: -1 })
        .lean();

      const total = await this.buysModel.countDocuments({
        supplierId: supplierId,
      });

      if (buys.length === 0) {
        return {
          success: false,
          message: 'No se encontraron compras para este proveedor',
        };
      }

      return {
        success: true,
        message: 'Compras encontradas',
        data: buys,
        pagination: {
          total: total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber),
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
