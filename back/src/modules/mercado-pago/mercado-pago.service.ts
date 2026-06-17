import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Preference, MercadoPagoConfig, Payment } from 'mercadopago';
import { Shops } from '../shops/shops.schema';
import { Model } from 'mongoose';
import { Sales } from '../sales/sales.schema';
import { SalesService } from '../sales/sales.service';
import { MercadoPago } from './mercado-pago.schema';
import { ConfigService } from '@nestjs/config';
import {
  randomUUID,
  createHmac,
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from 'crypto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);
  private readonly frontendUrl: string;

  constructor(
    @InjectModel(Shops.name) private shopsModel: Model<Shops>,
    @InjectModel(MercadoPago.name) private mercadoPagoModel: Model<MercadoPago>,
    private salesService: SalesService,
    private configService: ConfigService,
    private notificationsService: NotificationsService,
  ) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
  }

  private getEncryptionKey(): Buffer {
    const key = this.configService.get<string>('ENCRYPTION_KEY');
    if (!key || key.length !== 64) {
      throw new Error('ENCRYPTION_KEY debe ser exactamente 64 caracteres hex (32 bytes)');
    }
    return Buffer.from(key, 'hex');
  }

  private encrypt(text: string): string {
    const key = this.getEncryptionKey();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString('base64');
  }

  private decrypt(encryptedData: string): string {
    try {
      const key = this.getEncryptionKey();
      const buf = Buffer.from(encryptedData, 'base64');
      // Soporte legacy: si el dato no tiene el formato AES (< 28 bytes de overhead) asumir Base64 plano
      if (buf.length < 29) {
        return buf.toString('utf8');
      }
      const iv = buf.subarray(0, 12);
      const tag = buf.subarray(12, 28);
      const encrypted = buf.subarray(28);
      const decipher = createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(tag);
      return decipher.update(encrypted).toString('utf8') + decipher.final('utf8');
    } catch {
      // Fallback para tokens almacenados con Base64 legacy antes de la migración
      return Buffer.from(encryptedData, 'base64').toString('utf8');
    }
  }

  validateWebhookSignature(headers: Record<string, string>, body: any): void {
    const secret = this.configService.get<string>('MERCADOPAGO_WEBHOOK_SECRET');
    if (!secret) {
      this.logger.warn('MERCADOPAGO_WEBHOOK_SECRET no configurado — omitiendo validación de firma');
      return;
    }

    const xSignature = headers['x-signature'];
    const xRequestId = headers['x-request-id'];

    if (!xSignature || !xRequestId) {
      throw new ForbiddenException('Webhook sin firma válida de MercadoPago');
    }

    const parts = xSignature.split(',');
    const tsEntry = parts.find((p: string) => p.trim().startsWith('ts='));
    const v1Entry = parts.find((p: string) => p.trim().startsWith('v1='));

    if (!tsEntry || !v1Entry) {
      throw new ForbiddenException('Formato de firma de webhook inválido');
    }

    const ts = tsEntry.trim().split('=')[1];
    const v1 = v1Entry.trim().split('=')[1];
    const dataId = body?.data?.id ?? '';

    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
    const expectedHash = createHmac('sha256', secret).update(manifest).digest('hex');

    if (expectedHash !== v1) {
      throw new ForbiddenException('Firma de webhook de MercadoPago inválida');
    }
  }

  private async getMercadoPagoClient(shopId: string) {
    const userAccessToken = await this.mercadoPagoModel.findOne({
      shopId,
    });
    if (!userAccessToken) {
      throw new Error('No se encontró configuración de Mercado Pago para esta tienda');
    }
    const decryptedAccessToken = this.decrypt(userAccessToken.accessToken);

    return new MercadoPagoConfig({
      accessToken: decryptedAccessToken,
      options: {
        timeout: 5000,
        idempotencyKey: randomUUID(),
      },
    });
  }

  // Método para crear webhook personalizado por usuario
  async createWebhookForUser(shopId: string, webhookUrl?: string) {
    try {
      const client = await this.getMercadoPagoClient(shopId);

      // Crear URL de webhook específica para este usuario/tienda
      const notificationUrl =
        webhookUrl ||
        `${this.configService.get<string>('BASE_URL')}/mercado-pago/webhook/${shopId}`;

      this.logger.log(`Creando webhook para tienda: ${shopId}`);
      this.logger.log(`URL del webhook: ${notificationUrl}`);

      return notificationUrl;
    } catch (error) {
      this.logger.error('Error al crear webhook para usuario:', error);
      throw error;
    }
  }

  // Crear orden de pago con webhook específico
  async createNewOrder(body: {
    shopId: string;
    products: any[];
    total: number;
  }) {
    try {
      const { shopId, products, total } = body;

      // Validaciones
      if (!shopId) throw new Error('shopId es requerido');
      if (!Array.isArray(products) || products.length === 0)
        throw new Error('Debes enviar al menos un producto');
      if (typeof total !== 'number' || total <= 0)
        throw new Error('Total inválido');

      // Obtener cliente específico del usuario
      const client = await this.getMercadoPagoClient(shopId);

      // Crear URL de webhook específica para esta tienda
      const webhookUrl = await this.createWebhookForUser(shopId);

      const preference = new Preference(client);
      const result = await preference.create({
        body: {
          external_reference: shopId,
          metadata: {
            shopId,
            products,
            // Incluir identificador para webhook routing
            webhook_route: `shop_${shopId}`,
          },
          items: [
            {
              title: 'Compra en Distrify',
              quantity: 1,
              unit_price: total,
              currency_id: 'ARS',
              id: randomUUID(),
            },
          ],
          back_urls: {
            success: `${this.frontendUrl}/pago-exitoso`,
            failure: `${this.frontendUrl}/pago-fallido`,
            pending: `${this.frontendUrl}/pago-pendiente`,
          },
          // Webhook específico para esta tienda
          notification_url: webhookUrl,
        },
      });

      return result;
    } catch (error) {
      this.logger.error('Error al crear la orden de MP:', error);
      throw error;
    }
  }

  // Webhook genérico que identifica al usuario por el shopId en la URL
  async webhookByShop(shopId: string, body: any) {
    try {
      this.logger.log(`Webhook recibido para tienda: ${shopId}`);

      if (body.type !== 'payment') {
        this.logger.log('Webhook ignorado - no es de tipo payment');
        return { message: 'Webhook ignorado - no es de tipo payment' };
      }

      const paymentId = body.data.id;
      this.logger.log(`Procesando pago ID: ${paymentId} para tienda: ${shopId}`);

      // Obtener cliente específico del usuario directamente
      const client = await this.getMercadoPagoClient(shopId);

      // Obtener información del pago con el token correcto
      const payment = new Payment(client);
      const result = await payment.get({ id: paymentId });

      this.logger.log(`Estado del pago: ${result.status}`);

      // Verificar que el external_reference coincida con el shopId
      if (result.external_reference !== shopId) {
        throw new Error(
          `Mismatch de shopId. Esperado: ${shopId}, Recibido: ${result.external_reference}`,
        );
      }

      // Procesar solo pagos aprobados
      if (result.status !== 'approved') {
        this.logger.log(`Pago no aprobado. Estado: ${result.status}`);
        return {
          message: `Pago recibido pero no procesado. Estado: ${result.status}`,
          paymentStatus: result.status,
        };
      }

      // Crear la venta
      const metadata = result.metadata || {};
      const products = (metadata.products || []).map((p) => ({
        productId: p.product_id,
        ...p,
      }));

      const saleBody: any = {
        shopId,
        productDetails: products,
        total: result.transaction_amount,
        paymentMethod: 'Transferencia',
        cashier: 'Mercado Pago',
        paymentId: result.id,
        paymentStatus: result.status,
      };

      const venta: any = await this.salesService.create(saleBody);

      this.logger.log(`Venta creada exitosamente: ${venta.id}`);

      await this.notificationsService.create({
        shopId,
        type: 'PAYMENT_RECEIVED',
        status: 'UNREAD',
        title: 'Nueva venta creada',
        message: `Se ha recibido un nuevo pago por ${venta.total}`,
      });

      return {
        success: true,
        message: 'Venta creada automáticamente tras pago exitoso',
        venta,
      };
    } catch (error) {
      this.logger.error(`Error en webhook para tienda ${shopId}:`, error);

      this.logger.error('Detalles del error:', {
        shopId,
        paymentId: body?.data?.id,
        liveMode: body?.live_mode,
        errorMessage: error.message,
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  }

  // Webhook que busca en todas las tiendas hasta encontrar el pago (sin token global)
  async webhookWithoutGlobalToken(body: any) {
    try {
      if (body.type !== 'payment') {
        return { message: 'Webhook ignorado - no es de tipo payment' };
      }

      const paymentId = body.data.id;
      this.logger.log(`Buscando pago ${paymentId} en todas las tiendas...`);

      // Obtener todas las tiendas con tokens de MercadoPago
      const allShops = await this.mercadoPagoModel.find({});

      if (!allShops || allShops.length === 0) {
        throw new Error('No hay tiendas con MercadoPago configurado');
      }

      let paymentFound = null;
      let correctShopId = null;

      // Intentar encontrar el pago en cada tienda
      for (const shop of allShops) {
        try {
          this.logger.log(`Buscando en tienda: ${shop.shopId}`);

          const decryptedAccessToken = Buffer.from(
            shop.accessToken,
            'base64',
          ).toString();

          const client = new MercadoPagoConfig({
            accessToken: decryptedAccessToken,
            options: {
              timeout: 5000,
              idempotencyKey: randomUUID(),
            },
          });

          const payment = new Payment(client);
          const result = await payment.get({ id: paymentId });

          // Si llegamos aquí, el pago existe en esta tienda
          this.logger.log(`Pago encontrado en tienda: ${shop.shopId}`);
          paymentFound = result;
          correctShopId = shop.shopId;
          break;
        } catch (error) {
          // Si el error es 404 o similar, continuamos con la siguiente tienda
          this.logger.log(
            `Pago no encontrado en tienda ${shop.shopId}: ${error.message}`,
          );
          continue;
        }
      }

      if (!paymentFound || !correctShopId) {
        throw new Error(
          `Pago ${paymentId} no encontrado en ninguna tienda configurada`,
        );
      }

      // Verificar que el external_reference coincida (validación adicional)
      if (paymentFound.external_reference !== correctShopId) {
        this.logger.warn(
          `External reference mismatch: esperado ${correctShopId}, recibido ${paymentFound.external_reference}`,
        );
      }

      // Procesar el pago usando el shopId encontrado
      return await this.processPaymentForShop(correctShopId, paymentFound);
    } catch (error) {
      this.logger.error('Error en webhook sin token global:', error);
      throw error;
    }
  }

  // Método auxiliar para procesar el pago una vez que sabemos la tienda
  private async processPaymentForShop(shopId: string, paymentData: any) {
    try {
      this.logger.log(
        `Estado del pago: ${paymentData.status} para tienda: ${shopId}`,
      );

      // Procesar solo pagos aprobados
      if (paymentData.status !== 'approved') {
        this.logger.log(`Pago no aprobado. Estado: ${paymentData.status}`);
        return {
          message: `Pago recibido pero no procesado. Estado: ${paymentData.status}`,
          paymentStatus: paymentData.status,
          shopId,
        };
      }

      // Crear la venta
      const metadata = paymentData.metadata || {};
      const products = (metadata.products || []).map((p) => ({
        productId: p.product_id,
        ...p,
      }));

      const saleBody: any = {
        shopId,
        productDetails: products,
        total: paymentData.transaction_amount,
        paymentMethod: 'Transferencia',
        cashier: 'Mercado Pago',
        paymentId: paymentData.id,
        paymentStatus: paymentData.status,
      };

      const venta: any = await this.salesService.create(saleBody);

      this.logger.log(
        `Venta creada exitosamente para tienda ${shopId}: ${venta.id}`,
      );

      return {
        success: true,
        message: 'Venta creada automáticamente tras pago exitoso',
        shopId,
        venta,
      };
    } catch (error) {
      this.logger.error(`Error procesando pago para tienda ${shopId}:`, error);
      throw error;
    }
  }

  // Método de respaldo para webhook global (SIN usar token global)
  async webhook(body: any) {
    this.logger.log('Webhook global recibido - usando método optimizado...');
    return await this.webhookOptimized(body);
  }

  // Método para testing del webhook
  async testWebhook(shopId: string, mockPaymentData: any) {
    try {
      this.logger.log(`Testing webhook para tienda: ${shopId}`);

      const result = await this.webhookByShop(shopId, {
        type: 'payment',
        data: { id: mockPaymentData.paymentId },
        live_mode: false,
      });

      return {
        success: true,
        message: 'Test de webhook completado',
        result,
      };
    } catch (error) {
      this.logger.error('Error en test de webhook:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Método para obtener información de configuración de webhook
  async getWebhookConfig(shopId: string) {
    try {
      const webhookUrl = await this.createWebhookForUser(shopId);

      return {
        shopId,
        webhookUrl,
        specificEndpoint: `/mercado-pago/webhook/${shopId}`,
        fallbackEndpoint: '/mercado-pago/webhook',
      };
    } catch (error) {
      this.logger.error('Error al obtener configuración de webhook:', error);
      throw error;
    }
  }

  // Método optimizado que usa external_reference para identificar la tienda directamente
  async webhookOptimized(body: any) {
    try {
      if (body.type !== 'payment') {
        return { message: 'Webhook ignorado - no es de tipo payment' };
      }

      const paymentId = body.data.id;
      this.logger.log(`Procesando pago optimizado: ${paymentId}`);

      // Obtener todas las tiendas
      const allShops = await this.mercadoPagoModel.find({});

      if (!allShops || allShops.length === 0) {
        throw new Error('No hay tiendas con MercadoPago configurado');
      }

      // Crear un mapa de shopId -> token para acceso rápido
      const shopTokenMap = new Map();
      allShops.forEach((shop) => {
        const decryptedToken = this.decrypt(shop.accessToken);
        shopTokenMap.set(shop.shopId, decryptedToken);
      });

      // Intentar con cada token hasta encontrar el pago
      let paymentData = null;
      let correctShopId = null;

      for (const [shopId, accessToken] of shopTokenMap) {
        try {
          const client = new MercadoPagoConfig({
            accessToken,
            options: {
              timeout: 3000, // Timeout más corto para optimizar
              idempotencyKey: randomUUID(),
            },
          });

          const payment = new Payment(client);
          const result = await payment.get({ id: paymentId });

          // Verificar que el external_reference coincida con el shopId
          if (result.external_reference === shopId) {
            this.logger.log(
              `Pago ${paymentId} encontrado y verificado para tienda: ${shopId}`,
            );
            paymentData = result;
            correctShopId = shopId;
            break;
          } else {
            this.logger.log(
              `Pago encontrado pero external_reference no coincide. Esperado: ${shopId}, Recibido: ${result.external_reference}`,
            );
          }
        } catch (error) {
          // Error 404 o 401 significa que el pago no pertenece a esta tienda
          if (error.status === 404 || error.status === 401) {
            continue;
          }
          // Otros errores los logueamos pero continuamos
          this.logger.warn(
            `Error consultando pago en tienda ${shopId}: ${error.message}`,
          );
          continue;
        }
      }

      if (!paymentData || !correctShopId) {
        throw new Error(
          `Pago ${paymentId} no encontrado en ninguna tienda o external_reference no coincide`,
        );
      }

      // Procesar el pago
      return await this.processPaymentForShop(correctShopId, paymentData);
    } catch (error) {
      this.logger.error('Error en webhook optimizado:', error);
      throw error;
    }
  }

  // Resto de métodos existentes...
  async linkAccount(shopId: string, accessToken: string) {
    try {
      if (!shopId) {
        throw new Error('shopId es requerido');
      }
      if (!accessToken) {
        throw new Error('accessToken es requerido');
      }

      const shop = await this.shopsModel.findById(shopId);
      if (!shop) {
        throw new Error(`Negocio no encontrado con ID: ${shopId}`);
      }

      const encriptedAccessToken = this.encrypt(accessToken);

      const mercadoPagoData = await this.mercadoPagoModel.create({
        shopId,
        accessToken: encriptedAccessToken,
      });

      if (!mercadoPagoData) {
        throw new Error('Error al vincular la cuenta de Mercado Pago');
      }

      return {
        message: 'Cuenta de Mercado Pago vinculada correctamente',
        mercadoPagoData,
        webhookConfig: await this.getWebhookConfig(shopId),
      };
    } catch (error) {
      throw error;
    }
  }

  async unlinkAccount(shopId: string) {
    try {
      if (!shopId) {
        throw new Error('shopId es requerido');
      }

      const userAccessToken = await this.mercadoPagoModel.findOneAndDelete({
        shopId: shopId,
      });

      if (!userAccessToken) {
        throw new Error(
          'Cuenta de Mercado Pago no vinculada para este negocio',
        );
      }

      return {
        success: true,
        message: 'Cuenta de Mercado Pago desvinculada correctamente',
      };
    } catch (error) {
      throw error;
    }
  }

  async getAccessToken(shopId: string) {
    try {
      if (!shopId) {
        throw new Error('shopId es requerido');
      }

      const userAccessToken = await this.mercadoPagoModel.findOne({ shopId });

      if (!userAccessToken) {
        return {
          success: false,
          message: 'Cuenta de Mercado Pago no vinculada para este negocio',
        };
      }

      const decryptedAccessToken = this.decrypt(userAccessToken.accessToken);

      return { success: true, accessToken: decryptedAccessToken };
    } catch (error) {
      this.logger.error('Error al obtener el token de acceso:', error);
      throw error;
    }
  }
}
