import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Shops } from '../shops/shops.schema';
import { Users } from '../users/users.schema';
import { ShopPlanEnum, ShopStatusEnum } from '../shops/enum/shops.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Shops.name) private shopsModel: Model<Shops>,
    @InjectModel(Users.name) private usersModel: Model<Users>,
  ) {}

  // ─── MÉTRICAS GENERALES ────────────────────────────────────────────────────

  async getMetrics() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fifteenDaysAgo = new Date(now);
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    const [
      totalShops,
      totalUsers,
      activeShopsLast7,
      activeShopsLast30,
      inactiveShops,
      planDistribution,
      newShopsLast30,
      newUsersLast30,
    ] = await Promise.all([
      this.shopsModel.countDocuments(),
      this.usersModel.countDocuments(),
      // Shops con al menos un usuario activo en 7 días
      this.shopsModel.countDocuments({
        _id: {
          $in: await this.usersModel.distinct('shopId', {
            lastLogin: { $gte: sevenDaysAgo },
          }),
        },
      }),
      // Shops con al menos un usuario activo en 30 días
      this.shopsModel.countDocuments({
        _id: {
          $in: await this.usersModel.distinct('shopId', {
            lastLogin: { $gte: thirtyDaysAgo },
          }),
        },
      }),
      // Shops sin actividad en 15+ días
      this.shopsModel.countDocuments({
        _id: {
          $nin: await this.usersModel.distinct('shopId', {
            lastLogin: { $gte: fifteenDaysAgo },
          }),
        },
      }),
      // Distribución por plan
      this.shopsModel.aggregate([
        { $group: { _id: '$plan', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      // Nuevos negocios en 30 días
      this.shopsModel.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      // Nuevos usuarios en 30 días
      this.usersModel.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    ]);

    const planMap: Record<string, number> = {
      FREE: 0, BASIC: 0, MEDIUM: 0, PREMIUM: 0,
    };
    for (const item of planDistribution) {
      if (item._id) planMap[item._id] = item.count;
    }

    return {
      success: true,
      data: {
        totals: { shops: totalShops, users: totalUsers },
        activity: {
          activeShopsLast7,
          activeShopsLast30,
          inactiveShops,
        },
        growth: { newShopsLast30, newUsersLast30 },
        plans: planMap,
      },
    };
  }

  // ─── SHOPS ─────────────────────────────────────────────────────────────────

  async getAllShops(page: number, limit: number, search?: string, plan?: string, status?: string) {
    const pageNumber = Math.max(1, Number(page) || 1);
    const pageLimit = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (pageNumber - 1) * pageLimit;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (plan) filter.plan = plan;
    if (status) filter.status = status;

    const [shops, total] = await Promise.all([
      this.shopsModel.find(filter).skip(skip).limit(pageLimit).sort({ createdAt: -1 }).lean(),
      this.shopsModel.countDocuments(filter),
    ]);

    // Enriquecer con conteo de usuarios
    const shopIds = shops.map((s: any) => s._id);
    const userCounts = await this.usersModel.aggregate([
      { $match: { shopId: { $in: shopIds } } },
      { $group: { _id: '$shopId', count: { $sum: 1 } } },
    ]);
    const userCountMap = Object.fromEntries(userCounts.map((u) => [u._id.toString(), u.count]));

    const enriched = shops.map((s: any) => ({
      ...s,
      userCount: userCountMap[s._id.toString()] ?? 0,
    }));

    return {
      success: true,
      data: enriched,
      pagination: {
        total,
        page: pageNumber,
        limit: pageLimit,
        totalPages: Math.ceil(total / pageLimit),
      },
    };
  }

  async getShopDetail(shopId: string) {
    const shop = await this.shopsModel.findById(shopId).lean();
    if (!shop) throw new NotFoundException('Negocio no encontrado');

    const users = await this.usersModel
      .find({ shopId })
      .select('-password -verificationToken -passwordResetToken')
      .lean();

    return { success: true, data: { shop, users } };
  }

  async updateShopPlan(shopId: string, plan: ShopPlanEnum) {
    if (!Object.values(ShopPlanEnum).includes(plan)) {
      throw new BadRequestException('Plan inválido');
    }
    const shop = await this.shopsModel.findByIdAndUpdate(
      shopId,
      { plan },
      { new: true },
    );
    if (!shop) throw new NotFoundException('Negocio no encontrado');
    return { success: true, message: `Plan actualizado a ${plan}`, data: shop };
  }

  async updateShopStatus(shopId: string, status: ShopStatusEnum) {
    if (!Object.values(ShopStatusEnum).includes(status)) {
      throw new BadRequestException('Estado inválido');
    }
    const shop = await this.shopsModel.findByIdAndUpdate(
      shopId,
      { status },
      { new: true },
    );
    if (!shop) throw new NotFoundException('Negocio no encontrado');
    return { success: true, message: `Estado actualizado a ${status}`, data: shop };
  }

  async deleteShop(shopId: string) {
    const shop = await this.shopsModel.findByIdAndDelete(shopId);
    if (!shop) throw new NotFoundException('Negocio no encontrado');
    await this.usersModel.deleteMany({ shopId });
    return {
      success: true,
      message: 'Negocio y sus usuarios eliminados correctamente',
    };
  }

  // ─── USUARIOS ──────────────────────────────────────────────────────────────

  async getAllUsers(page: number, limit: number, search?: string, shopId?: string) {
    const pageNumber = Math.max(1, Number(page) || 1);
    const pageLimit = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (pageNumber - 1) * pageLimit;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (shopId) filter.shopId = shopId;

    const [users, total] = await Promise.all([
      this.usersModel
        .find(filter)
        .select('-password -verificationToken -passwordResetToken')
        .skip(skip)
        .limit(pageLimit)
        .sort({ createdAt: -1 })
        .populate('shopId', 'name plan')
        .lean(),
      this.usersModel.countDocuments(filter),
    ]);

    return {
      success: true,
      data: users,
      pagination: {
        total,
        page: pageNumber,
        limit: pageLimit,
        totalPages: Math.ceil(total / pageLimit),
      },
    };
  }

  async deleteUser(userId: string) {
    const user = await this.usersModel.findByIdAndDelete(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return { success: true, message: 'Usuario eliminado correctamente' };
  }

  async updateUserRoutes(userId: string, routesAllowed: string[]) {
    const user = await this.usersModel.findByIdAndUpdate(
      userId,
      { routesAllowed },
      { new: true },
    ).select('-password');
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return { success: true, message: 'Rutas actualizadas', data: user };
  }

  // ─── ACCIONES MASIVAS ──────────────────────────────────────────────────────

  async updateAllShopsPlan(plan: ShopPlanEnum) {
    if (!Object.values(ShopPlanEnum).includes(plan)) {
      throw new BadRequestException('Plan inválido');
    }
    const result = await this.shopsModel.updateMany({}, { plan });
    return {
      success: true,
      message: `${result.modifiedCount} negocios actualizados al plan ${plan}`,
    };
  }

  async previewInactiveShops() {
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    const allShops = await this.shopsModel.find({}).select('_id name email plan lastLogin').lean();
    const inactiveShops: any[] = [];

    for (const shop of allShops) {
      const activeUser = await this.usersModel.findOne({
        shopId: shop._id,
        lastLogin: { $gte: fifteenDaysAgo },
      });
      if (!activeUser) {
        const userCount = await this.usersModel.countDocuments({ shopId: shop._id });
        const lastActiveUser = await this.usersModel
          .findOne({ shopId: shop._id })
          .sort({ lastLogin: -1 })
          .select('username email lastLogin')
          .lean();
        inactiveShops.push({
          _id: shop._id,
          name: shop.name,
          email: shop.email,
          plan: shop.plan,
          lastLogin: shop.lastLogin,
          userCount,
          lastActiveUser,
        });
      }
    }

    const totalUsers = inactiveShops.reduce((sum, s) => sum + s.userCount, 0);

    return {
      success: true,
      data: {
        shops: inactiveShops,
        summary: {
          totalShops: inactiveShops.length,
          totalUsers,
          cutoffDate: fifteenDaysAgo,
        },
      },
    };
  }

  async deleteInactiveShops() {
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    const allShops = await this.shopsModel.find({}).select('_id').lean();
    const inactiveShopIds: any[] = [];

    for (const shop of allShops) {
      const activeUser = await this.usersModel.findOne({
        shopId: shop._id,
        lastLogin: { $gte: fifteenDaysAgo },
      });
      if (!activeUser) inactiveShopIds.push(shop._id);
    }

    if (inactiveShopIds.length === 0) {
      return { success: true, message: 'No hay negocios inactivos para eliminar' };
    }

    const [userDeletion, shopDeletion] = await Promise.all([
      this.usersModel.deleteMany({ shopId: { $in: inactiveShopIds } }),
      this.shopsModel.deleteMany({ _id: { $in: inactiveShopIds } }),
    ]);

    return {
      success: true,
      message: `Eliminados ${shopDeletion.deletedCount} negocios y ${userDeletion.deletedCount} usuarios por inactividad`,
      data: {
        shopsDeleted: shopDeletion.deletedCount,
        usersDeleted: userDeletion.deletedCount,
      },
    };
  }
}
