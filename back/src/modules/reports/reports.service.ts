/* eslint-disable */
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Buys } from '../buys/buys.schema';
import { Sales } from 'src/modules/sales/sales.schema';
import { Products } from '../products/products.schema';
import { Outputs } from '../outputs/outputs.schema';
import { Inputs } from '../inputs/inputs.schema';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectModel(Sales.name) private salesModel: Model<Sales>,
    @InjectModel(Products.name) private productsModel: Model<Products>,
    @InjectModel(Buys.name) private buysModel: Model<Buys>,
    @InjectModel(Outputs.name) private outputsModel: Model<Outputs>,
    @InjectModel(Inputs.name) private inputsModel: Model<Inputs>,
  ) {}

  async getBusinessReport(shopId: string, startDate?: Date, endDate?: Date) {
    try {
      // Construir filtros de fecha
      const dateFilter: any = { shopId };
      if (startDate || endDate) {
        dateFilter.createdAt = {};
        if (startDate) {
          dateFilter.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          dateFilter.createdAt.$lte = new Date(endDate);
        }
      }

      // Obtener ventas con populate de productos para obtener nombres
      const sales: any = await this.salesModel
        .find(dateFilter)
        .populate('productDetails.productId', 'name buyPrice sellPrice category categoryId')
        .populate('clientId', 'name')
        .select(
          'productDetails createdAt total subtotal iva discount surcharge cashier paymentMethod paymentMethods clientId status',
        )
        .sort({ createdAt: -1 })
        .lean();

      // Obtener compras con populate de proveedor
      const buys: any = await this.buysModel
        .find(dateFilter)
        .populate('supplierId', 'name')
        .select(
          'supplierId category total realCost totalAdditionalCosts additionalCosts createdAt cashierName paymentMethod paymentMethods productDetails date',
        )
        .sort({ createdAt: -1 })
        .lean();

      // Obtener egresos (outputs)
      const outputs: any = await this.outputsModel
        .find(dateFilter)
        .populate('userId', 'username')
        .select(
          'total category createdAt userId paymentMethod description date',
        )
        .sort({ createdAt: -1 })
        .lean();

      // Obtener ingresos (inputs)
      const inputs: any = await this.inputsModel
        .find(dateFilter)
        .populate('userId', 'username')
        .select('total category createdAt userId paymentMethod description')
        .sort({ createdAt: -1 })
        .lean();

      // Transformar datos para el frontend
      const transformedSales = sales.map((sale) => ({
        id: sale._id,
        date: sale.createdAt,
        total: sale.total,
        subtotal: sale.subtotal,
        iva: sale.iva,
        discount: sale.discount,
        surcharge: sale.surcharge,
        paymentMethod: sale.paymentMethod,
        paymentMethods: sale.paymentMethods,
        cashier: sale.cashier,
        client: sale.clientId?.name || 'Cliente sin nombre',
        status: sale.status,
        // Formato compatible con tu frontend que espera un solo producto principal
        product: sale.productDetails?.[0]?.productName || sale.productDetails?.[0]?.productId?.name || 'Venta múltiple',
        quantity:
          sale.productDetails?.reduce(
            (sum, detail) => sum + (detail.quantity || 0),
            0,
          ) || 1,
        unitPrice:
          sale.productDetails?.length > 0
            ? sale.total /
              sale.productDetails.reduce(
                (sum, detail) => sum + (detail.quantity || 0),
                1,
              )
            : sale.total,
        productDetails:
          sale.productDetails?.map((detail) => ({
            productId: detail.productId?._id ?? detail.productId,
            productName: detail.productName || detail.productId?.name || 'Producto sin nombre',
            quantity: detail.quantity,
            buyPrice: detail.productId?.buyPrice,
            sellPrice: detail.salePrice ?? detail.productId?.sellPrice,
          })) || [],
      }));

      const transformedBuys = buys.map((buy) => ({
        id: buy._id,
        date: buy.date || buy.createdAt,
        total: buy.total,
        realCost: buy.realCost || buy.total,
        totalAdditionalCosts: buy.totalAdditionalCosts || 0,
        additionalCosts: buy.additionalCosts || [],
        category: buy.category,
        supplier: buy.supplierId?.name || 'Proveedor sin nombre',
        paymentMethod: buy.paymentMethod,
        paymentMethods: buy.paymentMethods,
        cashier: buy.cashierName,
        product: buy.productDetails?.[0]?.productName || 'Compra múltiple',
        quantity:
          buy.productDetails?.reduce(
            (sum, detail) => sum + (detail.quantity || 0),
            0,
          ) || 1,
        unitCost:
          buy.productDetails?.length > 0
            ? buy.total /
              buy.productDetails.reduce(
                (sum, detail) => sum + (detail.quantity || 0),
                1,
              )
            : buy.total,
        productDetails: buy.productDetails || [],
      }));

      const transformedOutputs = outputs.map((output) => ({
        id: output._id,
        date: output.date || output.createdAt,
        total: output.total,
        amount: output.total, // Tu frontend usa 'amount' para expenses
        category: output.category,
        description: output.description,
        paymentMethod: output.paymentMethod,
        user: output.userId?.username || 'Usuario sin nombre',
      }));

      const transformedInputs = inputs.map((input) => ({
        id: input._id,
        date: input.createdAt,
        total: input.total,
        category: input.category,
        description: input.description,
        paymentMethod: input.paymentMethod,
        user: input.userId?.username || 'Usuario sin nombre',
      }));

      // Calcular totales
      const totalSales = transformedSales.reduce(
        (sum, sale) => sum + (sale.total || 0),
        0,
      );
      const totalPurchases = transformedBuys.reduce(
        (sum, buy) => sum + (buy.total || 0),
        0,
      );
      const totalRealCost = transformedBuys.reduce(
        (sum, buy) => sum + (buy.realCost || buy.total || 0),
        0,
      );
      const totalAdditionalCosts = transformedBuys.reduce(
        (sum, buy) => sum + (buy.totalAdditionalCosts || 0),
        0,
      );
      const totalOutputs = transformedOutputs.reduce(
        (sum, output) => sum + (output.total || 0),
        0,
      );
      const totalInputs = transformedInputs.reduce(
        (sum, input) => sum + (input.total || 0),
        0,
      );

      // Calcular margen bruto y neto
      const grossProfit = totalSales - totalRealCost;
      const grossMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;
      const netProfit = totalSales + totalInputs - totalOutputs - totalRealCost;
      const netMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

      // Calcular totales por método de pago
      const salesByPaymentMethod =
        this.calculatePaymentMethodTotals(transformedSales);
      const buysByPaymentMethod =
        this.calculatePaymentMethodTotals(transformedBuys);
      const outputsByPaymentMethod =
        this.calculatePaymentMethodTotals(transformedOutputs);
      const inputsByPaymentMethod =
        this.calculatePaymentMethodTotals(transformedInputs);

      // Calcular ventas por producto
      const salesByProduct = this.calculateSalesByProduct(transformedSales);

      // Calcular egresos por categoría
      const outputsByCategory =
        this.calculateOutputsByCategory(transformedOutputs);

      // Calcular compras por categoría
      const purchasesByCategory = this.calculatePurchasesByCategory(transformedBuys);

      // Calcular gastos adicionales por categoría (fletes, impuestos, etc.)
      const additionalCostsByCategory = this.calculateAdditionalCostsByCategory(transformedBuys);

      // Calcular ventas por categoría
      const salesByCategory = this.calculateSalesByCategory(transformedSales);

      // Calcular top productos por categoría
      const topProductsByCategory = this.calculateTopProductsByCategory(transformedSales);

      // Top clientes por volumen de compras
      const topClients = this.calculateTopClients(transformedSales);

      // Datos mensuales para gráficos
      const monthlySalesData = this.calculateMonthlyData(transformedSales);
      const monthlyOutputsData = this.calculateMonthlyData(transformedOutputs);
      const monthlyBuysData = this.calculateMonthlyData(transformedBuys);
      const monthlyInputsData = this.calculateMonthlyData(transformedInputs);
      const monthlyRealCostData = this.calculateMonthlyRealCost(transformedBuys);
      const monthlyProfitData = this.calculateMonthlyProfit(monthlySalesData, monthlyRealCostData, monthlyOutputsData);

      return {
        // Totales generales
        totals: {
          sales: totalSales,
          purchases: totalPurchases,
          realCost: totalRealCost,
          additionalCosts: totalAdditionalCosts,
          expenses: totalOutputs,
          incomes: totalInputs,
          netProfit,
          grossProfit,
          grossMargin: Math.round(grossMargin * 100) / 100,
          netMargin: Math.round(netMargin * 100) / 100,
        },

        // Totales por método de pago (formato compatible con frontend)
        salesByPaymentMethodTotals: salesByPaymentMethod,
        expensesByPaymentMethodTotals: outputsByPaymentMethod,
        purchasesByPaymentMethodTotals: buysByPaymentMethod,
        incomesByPaymentMethodTotals: inputsByPaymentMethod,

        // Análisis de productos y categorías
        salesByProduct,
        salesByCategory,
        topProductsByCategory,
        expensesByCategory: outputsByCategory,
        purchasesByCategory,
        additionalCostsByCategory,
        topClients,

        // Datos mensuales para gráficos
        monthlyData: {
          sales: monthlySalesData,
          expenses: monthlyOutputsData,
          purchases: monthlyBuysData,
          incomes: monthlyInputsData,
          realCost: monthlyRealCostData,
          profit: monthlyProfitData,
        },

        // Datos adicionales para comparativas MoM
        monthlySalesAggregated:
          this.formatMonthlyDataForFrontend(monthlySalesData),
        monthlyExpensesAggregated:
          this.formatMonthlyDataForFrontend(monthlyOutputsData),
        monthlyPurchasesAggregated:
          this.formatMonthlyDataForFrontend(monthlyBuysData),
      };
    } catch (error) {
      this.logger.error('Error in getBusinessReport:', error);
      throw new InternalServerErrorException(
        'Error al generar el reporte de negocio',
      );
    }
  }

  private calculatePaymentMethodTotals(data: any[]): Record<string, number> {
    const totals: Record<string, number> = {};

    data.forEach((item) => {
      // Si existe paymentMethods array y tiene elementos, usar esos datos (más detallado)
      if (
        item.paymentMethods &&
        Array.isArray(item.paymentMethods) &&
        item.paymentMethods.length > 0
      ) {
        item.paymentMethods.forEach((pm) => {
          const methodName = pm.method || 'Sin especificar';
          if (!totals[methodName]) {
            totals[methodName] = 0;
          }
          totals[methodName] += pm.amount || 0;
        });
      } else {
        // Solo usar paymentMethod si no existe paymentMethods o está vacío
        const method = item.paymentMethod || 'Sin especificar';
        if (!totals[method]) {
          totals[method] = 0;
        }
        totals[method] += item.total || 0;
      }
    });

    return totals;
  }

  private calculateSalesByProduct(
    sales: any[],
  ): Record<string, { total: number; quantity: number }> {
    const productSales: Record<string, { total: number; quantity: number }> =
      {};

    sales.forEach((sale) => {
      if (sale.productDetails && Array.isArray(sale.productDetails)) {
        sale.productDetails.forEach((detail) => {
          const productName = detail.productName || 'Producto sin nombre';
          if (!productSales[productName]) {
            productSales[productName] = { total: 0, quantity: 0 };
          }

          // Calcular el total del producto usando salePrice si está disponible, sino proporcional
          const unitPrice = detail.sellPrice ?? (sale.total / (sale.productDetails.length || 1));
          const productTotal = unitPrice * (detail.quantity || 1);
          productSales[productName].total += productTotal;
          productSales[productName].quantity += detail.quantity || 0;
        });
      }
    });

    return productSales;
  }

  private calculateOutputsByCategory(outputs: any[]): Record<string, number> {
    const categoryTotals: Record<string, number> = {};

    outputs.forEach((output) => {
      const category = output.category || 'Sin categoría';
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += output.total || 0;
    });

    return categoryTotals;
  }

  private calculateMonthlyData(data: any[]): Record<string, number> {
    const monthlyData: Record<string, number> = {};

    data.forEach((item) => {
      const date = new Date(item.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = 0;
      }
      monthlyData[monthYear] += item.total || 0;
    });

    return monthlyData;
  }

  private formatMonthlyDataForFrontend(
    monthlyData: Record<string, number>,
  ): Array<{ month: string; value: number }> {
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthYear, value]) => ({
        month: new Date(monthYear + '-01').toLocaleDateString('es-ES', {
          month: 'short',
          year: 'numeric',
        }),
        value,
      }));
  }

  private calculatePurchasesByCategory(buys: any[]): Record<string, number> {
    const totals: Record<string, number> = {};
    buys.forEach((buy) => {
      const category = buy.category || 'Sin categoría';
      totals[category] = (totals[category] || 0) + (buy.total || 0);
    });
    return totals;
  }

  private calculateAdditionalCostsByCategory(buys: any[]): Record<string, number> {
    const totals: Record<string, number> = {};
    buys.forEach((buy) => {
      if (buy.additionalCosts && Array.isArray(buy.additionalCosts)) {
        buy.additionalCosts.forEach((cost: any) => {
          const category = cost.category || cost.description || 'Otros';
          totals[category] = (totals[category] || 0) + (cost.amount || 0);
        });
      }
    });
    return totals;
  }

  private calculateTopClients(sales: any[]): Array<{ name: string; total: number; count: number }> {
    const clientMap: Record<string, { total: number; count: number }> = {};
    sales.forEach((sale) => {
      const name = sale.client || 'Sin cliente';
      if (!clientMap[name]) clientMap[name] = { total: 0, count: 0 };
      clientMap[name].total += sale.total || 0;
      clientMap[name].count += 1;
    });
    return Object.entries(clientMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }

  private calculateMonthlyRealCost(buys: any[]): Record<string, number> {
    const monthlyData: Record<string, number> = {};
    buys.forEach((buy) => {
      const date = new Date(buy.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + (buy.realCost || buy.total || 0);
    });
    return monthlyData;
  }

  private calculateMonthlyProfit(
    monthlySales: Record<string, number>,
    monthlyRealCost: Record<string, number>,
    monthlyOutputs: Record<string, number>,
  ): Record<string, number> {
    const allMonths = new Set([
      ...Object.keys(monthlySales),
      ...Object.keys(monthlyRealCost),
      ...Object.keys(monthlyOutputs),
    ]);
    const result: Record<string, number> = {};
    allMonths.forEach((month) => {
      result[month] =
        (monthlySales[month] || 0) -
        (monthlyRealCost[month] || 0) -
        (monthlyOutputs[month] || 0);
    });
    return result;
  }

  private calculateSalesByCategory(
    sales: any[],
  ): Record<string, { total: number; quantity: number }> {
    const result: Record<string, { total: number; quantity: number }> = {};

    sales.forEach((sale) => {
      if (sale.productDetails && Array.isArray(sale.productDetails)) {
        sale.productDetails.forEach((detail) => {
          const categoryName = detail.productId?.category || detail.productId?.categoryId?.name || 'Sin categoría';
          if (!result[categoryName]) {
            result[categoryName] = { total: 0, quantity: 0 };
          }
          const unitPrice = detail.sellPrice ?? (sale.total / (sale.productDetails.length || 1));
          result[categoryName].total += unitPrice * (detail.quantity || 1);
          result[categoryName].quantity += detail.quantity || 0;
        });
      }
    });

    return result;
  }

  private calculateTopProductsByCategory(
    sales: any[],
  ): Record<string, Array<{ name: string; total: number; quantity: number }>> {
    const byCategory: Record<string, Record<string, { total: number; quantity: number }>> = {};

    sales.forEach((sale) => {
      if (sale.productDetails && Array.isArray(sale.productDetails)) {
        sale.productDetails.forEach((detail) => {
          const categoryName = detail.productId?.category || detail.productId?.categoryId?.name || 'Sin categoría';
          const productName = detail.productName || detail.productId?.name || 'Producto sin nombre';

          if (!byCategory[categoryName]) {
            byCategory[categoryName] = {};
          }
          if (!byCategory[categoryName][productName]) {
            byCategory[categoryName][productName] = { total: 0, quantity: 0 };
          }

          const unitPrice = detail.sellPrice ?? (sale.total / (sale.productDetails.length || 1));
          byCategory[categoryName][productName].total += unitPrice * (detail.quantity || 1);
          byCategory[categoryName][productName].quantity += detail.quantity || 0;
        });
      }
    });

    const result: Record<string, Array<{ name: string; total: number; quantity: number }>> = {};
    for (const [category, products] of Object.entries(byCategory)) {
      result[category] = Object.entries(products)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.total - a.total);
    }

    return result;
  }
}
