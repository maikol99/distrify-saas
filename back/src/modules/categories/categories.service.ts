import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Categories } from './categories.schema';
import { Model } from 'mongoose';
import { createCategoryDto } from './categories.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Categories.name) private categoriesModel: Model<Categories>,
  ) {}

  //?Crear nueva categoria
  async createCategory(body: createCategoryDto) {
    try {
      if (!body.shopId || !body.name) {
        return {
          success: false,
          message: 'Los campos shopId y name son obligatorios',
        };
      }
      const category = await this.categoriesModel.create(body);
      if (!category) {
        return {
          success: false,
          message: 'Error al crear la categoria',
        };
      }
      return {
        success: true,
        message: 'Categoria creada correctamente',
        category,
      };
    } catch (error) {
      throw error;
    }
  }

  //?Obtener todas las categorias
  async getAllCategories() {
    try {
      const categories = await this.categoriesModel.find();
      if (!categories || categories.length === 0) {
        return {
          success: false,
          message: 'No se encontraron categorias',
        };
      }
      return {
        success: true,
        message: 'Categorias obtenidas correctamente',
        categories,
      };
    } catch (error) {
      throw error;
    }
  }

  //?Obtener categoria por ID
  async getCategoryById(id: string) {
    try {
      if (!id) {
        return {
          success: false,
          message: 'El ID es obligatorio',
        };
      }
      const category = await this.categoriesModel.findById(id);
      if (!category) {
        return {
          success: false,
          message: 'Categoria no encontrada',
        };
      }
      return {
        success: true,
        message: 'Categoria obtenida correctamente',
        category,
      };
    } catch (error) {
      throw error;
    }
  }

  //?Obtener categorias por shopId
  async getCategoriesByShopId(shopId: string, page?: number, limit?: number) {
    try {
      if (!shopId) {
        return {
          success: false,
          message: 'El shopId es obligatorio',
        };
      }

      if (page && limit && (page < 1 || limit < 1)) {
        return {
          success: false,
          message: 'Los valores de page y limit deben ser mayores a 0',
        };
      }

      const skip = (page - 1) * limit;

      const categories = await this.categoriesModel
        .find({ shopId })
        .skip(skip)
        .limit(limit)
        .sort({ name: 1 });
      if (!categories || categories.length === 0) {
        return {
          success: false,
          message: 'No se encontraron categorias para esta tienda',
        };
      }
      return {
        success: true,
        message: 'Categorias obtenidas correctamente',
        categories,
        pagination: {
          page: page,
          total: await this.categoriesModel.countDocuments({ shopId }),
          totalPages: Math.ceil(
            (await this.categoriesModel.countDocuments({ shopId })) / limit,
          ),
          limit: limit,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  //?Actualizar categoria
  async updateCategory(id: string, body: any) {
    try {
      if (!id) {
        return {
          success: false,
          message: 'El ID es obligatorio',
        };
      }
      const category = await this.categoriesModel.findByIdAndUpdate(id, body, {
        new: true,
      });
      if (!category) {
        return {
          success: false,
          message: 'Categoria no encontrada o error al actualizar',
        };
      }
      return {
        success: true,
        message: 'Categoria actualizada correctamente',
        category,
      };
    } catch (error) {
      throw error;
    }
  }

  //?Eliminar categoria
  async deleteCategory(id: string) {
    try {
      if (!id) {
        return {
          success: false,
          message: 'El ID es obligatorio',
        };
      }
      const category = await this.categoriesModel.findByIdAndDelete(id);
      if (!category) {
        return {
          success: false,
          message: 'Categoria no encontrada',
        };
      }
      return {
        success: true,
        message: 'Categoria eliminada correctamente',
        category,
      };
    } catch (error) {
      throw error;
    }
  }

  //?Buscar categorias por nombre

  async searchCategoriesByName(
    name: string,
    shopId: string,
    page?: number,
    limit?: number,
  ) {
    try {
      if (!name) {
        return {
          success: false,
          message: 'El nombre es obligatorio',
        };
      }

      if (page && limit && (page < 1 || limit < 1)) {
        return {
          success: false,
          message: 'Los valores de page y limit deben ser mayores a 0',
        };
      }

      const skip = (page - 1) * limit;

      const categories = await this.categoriesModel
        .find({ shopId, name: new RegExp(name, 'i') })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
      if (!categories || categories.length === 0) {
        return {
          success: false,
          message: 'No se encontraron categorias con ese nombre',
        };
      }
      return {
        success: true,
        message: 'Categorias obtenidas correctamente',
        categories,
        pagination: {
          page: page,
          total: await this.categoriesModel.countDocuments({
            name: new RegExp(name, 'i'),
          }),
          totalPages: Math.ceil(
            (await this.categoriesModel.countDocuments({
              name: new RegExp(name, 'i'),
            })) / limit,
          ),
          limit: limit,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
