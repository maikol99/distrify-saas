import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import sanitizeHtml from 'sanitize-html';

@Injectable()
export class EmailsService {
  private readonly logger = new Logger(EmailsService.name);
  private readonly resend: Resend;
  private readonly emailFrom: string;
  private readonly emailFromName: string;
  private readonly frontendUrl: string;

  constructor(private configService: ConfigService) {
    this.emailFrom = this.configService.get<string>('EMAIL_FROM', 'noreply@example.com');
    this.emailFromName = this.configService.get<string>('EMAIL_FROM_NAME', 'Distrify');
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');

    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) throw new Error('RESEND_API_KEY no está configurada en las variables de entorno');
    this.resend = new Resend(apiKey);
  }

  private sanitize(value: string): string {
    if (!value) return '';
    return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} });
  }

  private get from(): string {
    return `${this.emailFromName} <${this.emailFrom}>`;
  }

  //Enviar ticket por email
  async sendTicketByEmailWithAttachment(
    to: string,
    subject: string,
    file: Express.Multer.File,
    businessName = 'Tu Negocio',
    total = 0,
    paymentSummary: { method: string; amount: number }[] = [],
    date = new Date().toISOString(),
  ) {
    try {
      const formattedDate = new Date(date).toLocaleString('es-AR', {
        dateStyle: 'long',
        timeStyle: 'short',
      });

      const paymentDetails = paymentSummary.length
        ? paymentSummary
            .map(
              (p) =>
                `<li>${p.method}: <strong>$${p.amount.toFixed(2)}</strong></li>`,
            )
            .join('')
        : `<li><em>No se especificaron métodos de pago.</em></li>`;

      const htmlBody = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', Arial, sans-serif; background: #f8f7f5; color: #1e293b; }
          .wrapper { padding: 32px 16px; }
          .email-container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #f9931e, #e8821a); padding: 28px 32px; text-align: center; }
          .logo { font-family: 'Poppins', sans-serif; font-size: 22px; font-weight: 700; color: #ffffff; }
          .header-sub { font-size: 13px; color: rgba(255,255,255,0.85); margin-top: 2px; }
          .content { padding: 32px; }
          .greeting { font-size: 16px; color: #475569; margin-bottom: 16px; }
          .summary { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 20px 0; }
          .summary-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 14px; color: #475569; border-bottom: 1px solid #f1f5f9; }
          .summary-row:last-child { border-bottom: none; font-weight: 600; color: #1e293b; }
          .summary-label { color: #64748b; }
          .attachment { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 14px 16px; margin: 16px 0; font-size: 14px; color: #92400e; }
          .footer { background: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; }
          .footer-text { font-size: 13px; color: #64748b; margin-bottom: 4px; }
          .disclaimer { font-size: 11px; color: #94a3b8; margin-top: 8px; }
          @media (max-width: 600px) {
            .wrapper { padding: 16px 8px; }
            .content, .footer { padding: 20px 16px; }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="email-container">
            <div class="header">
              <div class="logo">${businessName}</div>
              <div class="header-sub">Comprobante de compra</div>
            </div>
            <div class="content">
              <div class="greeting">Hola, gracias por tu compra. Adjuntamos el comprobante en formato PDF.</div>
              <div class="summary">
                <div class="summary-row">
                  <span class="summary-label">Fecha</span>
                  <span>${formattedDate}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Total</span>
                  <span>$${total.toFixed(2)}</span>
                </div>
              </div>
              <div class="attachment">📎 Comprobante adjunto: <strong>${file.originalname}</strong></div>
              <p style="font-size:14px;color:#475569;margin-top:16px;">Si tenés alguna duda, respondé este correo.</p>
            </div>
            <div class="footer">
              <div class="footer-text">Saludos, <strong>${businessName}</strong></div>
              <div class="disclaimer">Este correo fue enviado automáticamente.</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

      const { error } = await this.resend.emails.send({
        from: this.from,
        to,
        subject,
        html: htmlBody,
        attachments: [
          {
            filename: file.originalname,
            content: file.buffer,
          },
        ],
      });

      if (error) throw new Error(error.message);

      return { success: true, message: 'Email enviado con PDF y resumen' };
    } catch (error) {
      this.logger.error('Error enviando email:', error);
      throw error;
    }
  }

  //?Enviar email de recuperacion de contraseña
  async sendPasswordResetEmail(
    to: string,
    verificationToken: string,
    userName?: string,
  ) {
    try {
      const subject = 'Restablecimiento de contraseña - Distrify';

      const htmlBody = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Restablecimiento de contraseña - Distrify</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', Arial, sans-serif; background-color: #f8f7f5; color: #1e293b; }
          .wrapper { padding: 32px 16px; }
          .email-container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #f9931e, #e8821a); padding: 36px 32px; text-align: center; }
          .logo { font-family: 'Poppins', sans-serif; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; }
          .header-sub { font-size: 14px; color: rgba(255,255,255,0.85); margin-top: 4px; font-weight: 400; }
          .content { padding: 36px 32px; }
          .greeting { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 12px; }
          .message { font-size: 15px; color: #475569; line-height: 1.7; margin-bottom: 28px; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn-main { display: inline-block; background: linear-gradient(135deg, #f9931e, #e8821a); color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 15px; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(249,147,30,0.35); }
          .warning-box { background-color: #fffbeb; border-left: 3px solid #f59e0b; padding: 14px 16px; border-radius: 8px; margin: 20px 0; }
          .warning-text { font-size: 13px; color: #92400e; }
          .steps { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; margin: 20px 0; }
          .steps-title { font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 12px; }
          .steps ul { list-style: none; padding: 0; }
          .steps ul li { font-size: 13px; color: #475569; padding: 4px 0 4px 20px; position: relative; }
          .steps ul li:before { content: "→"; position: absolute; left: 0; color: #f9931e; font-weight: 600; }
          .security { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 14px 16px; margin: 20px 0; }
          .security-text { font-size: 13px; color: #dc2626; }
          .footer { background: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0; }
          .footer-text { font-size: 13px; color: #64748b; margin-bottom: 8px; }
          .company { font-weight: 600; color: #1e293b; }
          .disclaimer { font-size: 11px; color: #94a3b8; margin-top: 8px; }
          @media (max-width: 600px) {
            .wrapper { padding: 16px 8px; }
            .content, .footer { padding: 24px 20px; }
            .header { padding: 28px 20px; }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="email-container">
            <div class="header">
              <div class="logo">Distrify</div>
              <div class="header-sub">Sistema de Gestión de Negocios</div>
            </div>
            <div class="content">
              <div class="greeting">Hola${userName ? ` ${userName}` : ''},</div>
              <div class="message">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en Distrify.
                Si no la solicitaste, podés ignorar este correo sin problema.
              </div>
              <div class="btn-container">
                <a href="${this.frontendUrl}/validar-codigo/${verificationToken}" class="btn-main">Restablecer contraseña</a>
              </div>
              <div class="warning-box">
                <div class="warning-text">⏱ Este enlace expira en <strong>1 hora</strong>. Después deberás generar uno nuevo.</div>
              </div>
              <div class="steps">
                <div class="steps-title">¿Cómo restablecer tu contraseña?</div>
                <ul>
                  <li>Hacé clic en el botón de arriba</li>
                  <li>Ingresá tu nueva contraseña</li>
                  <li>Confirmá los cambios y listo</li>
                </ul>
              </div>
              <div class="security">
                <div class="security-text">🔒 Por tu seguridad, nunca compartas este enlace. El equipo de Distrify jamás te lo solicitará.</div>
              </div>
            </div>
            <div class="footer">
              <div class="footer-text">¿Necesitás ayuda? Respondé este correo y te asistimos.</div>
              <div class="footer-text">Saludos, <span class="company">Equipo de Distrify</span></div>
              <div class="disclaimer">Este correo fue enviado automáticamente.</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

      const { error } = await this.resend.emails.send({
        from: this.from,
        to,
        subject,
        html: htmlBody,
      });

      if (error) throw new Error(error.message);

      return { success: true, message: 'Email de restablecimiento enviado correctamente' };
    } catch (error) {
      this.logger.error('Error enviando email de restablecimiento:', error);
      throw new Error('Error al enviar el email de restablecimiento de contraseña');
    }
  }

  //?Enviar email de verificación de cuenta
  async sendEmailVerificationToken(
    to: string,
    verificationToken: string,
    userName?: string,
  ) {
    try {
      const subject = 'Bienvenido a Distrify - Verifica tu cuenta';

      const htmlBody = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verificá tu cuenta - Distrify</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', Arial, sans-serif; background: #f8f7f5; color: #1e293b; }
        .wrapper { padding: 32px 16px; }
        .email-container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #f9931e, #e8821a); padding: 36px 32px; text-align: center; color: white; }
        .logo { font-family: 'Poppins', sans-serif; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; }
        .header-sub { font-size: 14px; color: rgba(255,255,255,0.85); margin-top: 4px; }
        .content { padding: 36px 32px; }
        .greeting { font-size: 22px; font-weight: 700; color: #1e293b; margin-bottom: 6px; text-align: center; }
        .sub-greeting { font-size: 14px; color: #f9931e; text-align: center; font-weight: 500; margin-bottom: 24px; }
        .message { font-size: 15px; color: #475569; line-height: 1.7; margin-bottom: 24px; text-align: center; }
        .btn-container { text-align: center; margin: 28px 0; }
        .btn-main { display: inline-block; background: linear-gradient(135deg, #f9931e, #e8821a); color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 15px; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(249,147,30,0.35); }
        .timer-box { background: #fffbeb; border-left: 3px solid #f59e0b; padding: 14px 16px; border-radius: 8px; margin: 20px 0; }
        .timer-text { font-size: 13px; color: #92400e; }
        .steps { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; margin: 20px 0; }
        .steps-title { font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 12px; }
        .steps ul { list-style: none; counter-reset: step-counter; padding: 0; }
        .steps ul li { font-size: 13px; color: #475569; padding: 5px 0 5px 28px; position: relative; }
        .steps ul li:before { content: counter(step-counter); counter-increment: step-counter; position: absolute; left: 0; background: #f9931e; color: white; width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }
        .alt-link { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin: 20px 0; text-align: center; }
        .alt-link-label { font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px; }
        .alt-link-url { font-size: 11px; color: #64748b; word-break: break-all; font-family: 'Courier New', monospace; background: #ffffff; padding: 6px 8px; border-radius: 4px; border: 1px solid #e2e8f0; display: block; }
        .footer { background: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer-text { font-size: 13px; color: #64748b; margin-bottom: 8px; }
        .company { font-weight: 600; color: #1e293b; }
        .disclaimer { font-size: 11px; color: #94a3b8; margin-top: 8px; }
        @media (max-width: 600px) {
          .wrapper { padding: 16px 8px; }
          .content, .footer { padding: 24px 20px; }
          .header { padding: 28px 20px; }
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="email-container">
          <div class="header">
            <div class="logo">Distrify</div>
            <div class="header-sub">Sistema de Gestión de Negocios</div>
          </div>
          <div class="content">
            <div class="greeting">¡Bienvenido${userName ? ` ${userName}` : ''}!</div>
            <div class="sub-greeting">Tu cuenta está casi lista</div>
            <div class="message">
              Gracias por registrarte en Distrify. Para activar tu cuenta y comenzar a gestionar tu negocio, verificá tu correo electrónico.
            </div>
            <div class="btn-container">
              <a href="${this.frontendUrl}/validar-email/${verificationToken}" class="btn-main">Verificar mi cuenta</a>
            </div>
            <div class="timer-box">
              <div class="timer-text">⏱ Este enlace expira en <strong>24 horas</strong>. Si expira, podés solicitar uno nuevo desde el login.</div>
            </div>
            <div class="steps">
              <div class="steps-title">Pasos para completar tu registro:</div>
              <ul>
                <li>Hacé clic en el botón de arriba</li>
                <li>Tu cuenta se verificará automáticamente</li>
                <li>Iniciá sesión y configurá tu negocio</li>
              </ul>
            </div>
            <div class="alt-link">
              <div class="alt-link-label">¿El botón no funciona? Copiá y pegá este enlace:</div>
              <span class="alt-link-url">${this.frontendUrl}/validar-email/${verificationToken}</span>
            </div>
          </div>
          <div class="footer">
            <div class="footer-text">¿Tenés problemas? Respondé este correo y te ayudamos.</div>
            <div class="footer-text">Saludos, <span class="company">Equipo de Distrify</span></div>
            <div class="disclaimer">Este correo fue enviado automáticamente. Si no te registraste en Distrify, podés ignorarlo.</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

      const { error } = await this.resend.emails.send({
        from: this.from,
        to,
        subject,
        html: htmlBody,
      });

      if (error) throw new Error(error.message);

      return { success: true, message: 'Email de verificación enviado correctamente' };
    } catch (error) {
      this.logger.error('Error enviando email de verificación:', error);
      throw new Error('Error al enviar el email de verificación de cuenta');
    }
  }

  //?Enviar email de bienvenida
  async sendWelcomeEmail(to: string, userName: string, userEmail: string) {
    try {
      const subject = `¡Bienvenido a Distrify, ${userName}!`;

      const htmlBody = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>¡Bienvenido a Distrify!</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', Arial, sans-serif; background: #f8f7f5; color: #1e293b; }
          .wrapper { padding: 32px 16px; }
          .email-container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; }
          .hero-header { background: linear-gradient(135deg, #f9931e, #e8821a); padding: 40px 32px; text-align: center; color: white; }
          .logo { font-family: 'Poppins', sans-serif; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; }
          .header-sub { font-size: 14px; color: rgba(255,255,255,0.85); margin-top: 4px; }
          .content { padding: 36px 32px; }
          .greeting { font-size: 22px; font-weight: 700; color: #1e293b; margin-bottom: 6px; }
          .message { font-size: 15px; color: #475569; line-height: 1.7; margin-bottom: 24px; }
          .steps { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; margin: 20px 0; }
          .steps-title { font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 12px; }
          .steps ul { list-style: none; counter-reset: step-counter; padding: 0; }
          .steps ul li { font-size: 13px; color: #475569; padding: 5px 0 5px 28px; position: relative; }
          .steps ul li:before { content: counter(step-counter); counter-increment: step-counter; position: absolute; left: 0; background: #f9931e; color: white; width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn-main { display: inline-block; background: linear-gradient(135deg, #f9931e, #e8821a); color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 15px; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(249,147,30,0.35); }
          .footer { background: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0; }
          .footer-text { font-size: 13px; color: #64748b; margin-bottom: 8px; }
          .company { font-weight: 600; color: #1e293b; }
          .disclaimer { font-size: 11px; color: #94a3b8; margin-top: 8px; }
          @media (max-width: 600px) {
            .wrapper { padding: 16px 8px; }
            .content, .footer { padding: 24px 20px; }
            .hero-header { padding: 28px 20px; }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="email-container">
            <div class="hero-header">
              <div class="logo">Distrify</div>
              <div class="header-sub">Sistema de Gestión de Negocios</div>
            </div>
            <div class="content">
              <div class="greeting">¡Bienvenido, ${userName}!</div>
              <div class="message">
                Tu cuenta en Distrify está lista. Empezá a gestionar tu negocio hoy mismo.
              </div>
              <div class="steps">
                <div class="steps-title">Primeros pasos:</div>
                <ul>
                  <li>Configurá la información de tu negocio</li>
                  <li>Cargá tus productos o servicios</li>
                  <li>Registrá tus primeros clientes</li>
                  <li>Realizá tu primera venta</li>
                </ul>
              </div>
              <div class="btn-container">
                <a href="${this.frontendUrl}/iniciar-sesion" class="btn-main">Ir a mi panel</a>
              </div>
            </div>
            <div class="footer">
              <div class="footer-text">¿Tenés dudas? Respondé este correo y te ayudamos.</div>
              <div class="footer-text">Saludos, <span class="company">Equipo de Distrify</span></div>
              <div class="disclaimer">Recibiste este correo porque te registraste con: ${userEmail}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

      const { error } = await this.resend.emails.send({
        from: this.from,
        to,
        subject,
        html: htmlBody,
      });

      if (error) throw new Error(error.message);

      return { success: true, message: 'Email de bienvenida enviado correctamente' };
    } catch (error) {
      this.logger.error('Error enviando email de bienvenida:', error);
      throw new Error('Error al enviar el email de bienvenida');
    }
  }

  // Enviar email de confirmación de pedido
  async sendOrderConfirmationEmail(orderData: {
    shopId: string;
    deliveryType: 'Delivery' | 'Retiro';
    paymentType: 'Presencial' | 'Mercado Pago';
    total: number;
    email: string;
    client: {
      name: string;
      phone: string;
      email: string;
      address: string;
      city: string;
      postalCode: string;
    };
    productDetails: Array<{
      name: string;
      quantity: number;
      sellPrice: number;
      variants?: Array<{
        size?: string;
        color?: string;
        quantity: number;
      }>;
    }>;
    shop: {
      name: string;
      address: string;
      phone: string;
      email: string;
    };
  }) {
    try {
      const { deliveryType, paymentType, total, client, productDetails, shop } = orderData;

      const subject = `✅ Confirmación de Pedido - ${shop.name}`;

      const deliveryIcon = deliveryType === 'Delivery' ? '🚚' : '🏪';
      const deliveryTitle = deliveryType === 'Delivery' ? 'Envío a Domicilio' : 'Retiro en Local';

      const paymentMessage =
        paymentType === 'Presencial'
          ? deliveryType === 'Delivery'
            ? 'Deberás pagar cuando recibas el pedido'
            : 'Deberás pagar cuando retires el pedido en el local'
          : 'El pago ya fue procesado exitosamente a través de Mercado Pago';

      const paymentIcon = paymentType === 'Presencial' ? '💰' : '✅';

      const productsHtml = productDetails
        .map((product, index) => {
          const variantsHtml = product.variants
            ? product.variants
                .map((variant) => {
                  const details = [];
                  if (variant.size) details.push(`Talle: ${variant.size}`);
                  if (variant.color) details.push(`Color: ${variant.color}`);
                  return details.length > 0
                    ? `<div class="variant-info">${details.join(' • ')}</div>`
                    : '';
                })
                .join('')
            : '';

          return `
        <div class="product-item">
          <div class="product-number">${index + 1}</div>
          <div class="product-details">
            <div class="product-title">Producto: ${product.name}</div>
            ${variantsHtml}
            <div class="product-quantity">Cantidad: <strong>${product.quantity}</strong></div>
            <div class="product-price">Precio: <strong>$${product.sellPrice}</strong></div>
            <div class="product-subtotal">Subtotal: <strong>$${product.quantity * product.sellPrice}</strong></div>
          </div>
        </div>
      `;
        })
        .join('');

      const htmlBody = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Pedido - ${shop.name}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; }
        .email-container { max-width: 650px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 20px 40px rgba(0,0,0,0.1); border-radius: 20px; overflow: hidden; }
        .hero-header { background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%); padding: 60px 40px; text-align: center; color: white; }
        .hero-title { font-size: 36px; font-weight: 800; margin-bottom: 12px; letter-spacing: -1px; }
        .hero-subtitle { font-size: 18px; opacity: 0.95; font-weight: 400; margin-bottom: 16px; }
        .content { padding: 50px 40px; }
        .welcome-message { font-size: 18px; color: #374151; text-align: center; margin-bottom: 40px; line-height: 1.8; }
        .order-summary { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 16px; padding: 32px; margin: 32px 0; border: 1px solid #e2e8f0; }
        .summary-title { font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 24px; text-align: center; }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-bottom: 32px; }
        .info-card { background: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; }
        .info-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .info-icon { font-size: 24px; }
        .info-title { font-size: 18px; font-weight: 600; color: #1e293b; }
        .info-content { font-size: 14px; color: #64748b; line-height: 1.6; }
        .info-highlight { color: #059669; font-weight: 600; }
        .products-section { margin: 40px 0; }
        .products-title { font-size: 24px; font-weight: 700; color: #1e293b; text-align: center; margin-bottom: 32px; }
        .product-item { background: #ffffff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 16px; display: flex; gap: 16px; align-items: flex-start; }
        .product-number { background: linear-gradient(135deg, #10b981, #059669); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
        .product-details { flex: 1; }
        .product-title { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
        .variant-info { font-size: 14px; color: #6b7280; margin-bottom: 8px; padding: 4px 8px; background: #f3f4f6; border-radius: 6px; display: inline-block; }
        .product-quantity, .product-price, .product-subtotal { font-size: 14px; color: #64748b; margin-bottom: 4px; }
        .total-section { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 16px; padding: 32px; text-align: center; margin: 40px 0; color: white; }
        .total-title { font-size: 24px; font-weight: 700; margin-bottom: 16px; }
        .total-amount { font-size: 36px; font-weight: 800; margin-bottom: 16px; }
        .shop-info { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 1px solid #a7f3d0; border-radius: 16px; padding: 32px; margin: 40px 0; }
        .shop-title { font-size: 20px; font-weight: 600; color: #065f46; margin-bottom: 16px; text-align: center; }
        .shop-details { color: #047857; font-size: 16px; text-align: center; }
        .shop-detail { margin-bottom: 8px; }
        .footer { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 40px; text-align: center; color: white; }
        .footer-text { font-size: 16px; opacity: 0.9; margin-bottom: 16px; }
        .footer-disclaimer { font-size: 12px; color: rgba(255,255,255,0.7); margin-top: 24px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.2); }
        @media (max-width: 650px) {
          .email-container { margin: 0; border-radius: 0; }
          .hero-header { padding: 40px 24px; }
          .hero-title { font-size: 28px; }
          .content { padding: 32px 24px; }
          .info-grid { grid-template-columns: 1fr; }
          .total-amount { font-size: 28px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="hero-header">
          <div class="hero-title">¡Pedido Confirmado!</div>
          <div class="hero-subtitle">Tu pedido ha sido recibido y procesado</div>
        </div>
        <div class="content">
          <div class="welcome-message">
            Hola <strong>${client.name}</strong>, hemos recibido tu pedido correctamente.
            A continuación encontrarás todos los detalles de tu compra y la información
            necesaria para ${deliveryType === 'Delivery' ? 'recibir' : 'retirar'} tu pedido.
          </div>
          <div class="order-summary">
            <div class="summary-title">📋 Resumen del Pedido</div>
            <div class="info-grid">
              <div class="info-card">
                <div class="info-card-header">
                  <span class="info-icon">${deliveryIcon}</span>
                  <div class="info-title">${deliveryTitle}</div>
                </div>
                <div class="info-content">
                  ${
                    deliveryType === 'Delivery'
                      ? `<strong>Dirección de entrega:</strong><br>${client.address}<br>${client.city}<br>${client.postalCode}`
                      : `<strong>Retira en:</strong><br>${shop.name}<br>${shop.address}`
                  }
                </div>
              </div>
              <div class="info-card">
                <div class="info-card-header">
                  <span class="info-icon">${paymentIcon}</span>
                  <div class="info-title">Método de Pago</div>
                </div>
                <div class="info-content">
                  <strong>${paymentType}</strong><br>
                  <span class="info-highlight">${paymentMessage}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="products-section">
            <div class="products-title">🛍️ Productos Comprados</div>
            ${productsHtml}
          </div>
          <div class="total-section">
            <div class="total-title">Total del Pedido</div>
            <div class="total-amount">$${total}</div>
          </div>
          <div class="shop-info">
            <div class="shop-title">🏪 Información del Local</div>
            <div class="shop-details">
              <div class="shop-detail"><strong>${shop.name}</strong></div>
              <div class="shop-detail">📍 ${shop.address}</div>
              <div class="shop-detail">📞 ${shop.phone}</div>
              <div class="shop-detail">📧 ${shop.email}</div>
            </div>
          </div>
        </div>
        <div class="footer">
          <div class="footer-text">Gracias por tu compra. Si tenés alguna consulta, no dudes en contactarnos.</div>
          <div class="footer-disclaimer">Este email fue enviado a ${client.email} como confirmación de tu pedido.</div>
        </div>
      </div>
    </body>
    </html>
  `;

      const { error } = await this.resend.emails.send({
        from: this.from,
        to: orderData.email,
        subject,
        html: htmlBody,
      });

      if (error) throw new Error(error.message);

      this.logger.log(`Email de confirmación de pedido enviado a: ${orderData?.client?.email || 'desconocido'}`);
      return { success: true, message: 'Email de confirmación de pedido enviado correctamente' };
    } catch (error) {
      this.logger.error('Error enviando email de confirmación de pedido:', error);
      throw new Error('Error al enviar el email de confirmación de pedido');
    }
  }

  //Enviar resumen de caja //?Enviar resumen diario del negocio
  async sendDailyBusinessSummary(
    to: string,
    reportData: {
      totals: {
        sales: number;
        purchases: number;
        expenses: number;
        incomes: number;
      };
      salesByPaymentMethodTotals: Record<string, number>;
      expensesByPaymentMethodTotals: Record<string, number>;
      purchasesByPaymentMethodTotals: Record<string, number>;
      incomesByPaymentMethodTotals: Record<string, number>;
    },
    date: Date = new Date(),
  ) {
    try {
      const formattedDate = new Date(date).toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const subject = `Resumen Diario - Distrify | ${new Date(date).toLocaleDateString('es-AR')}`;

      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
          style: 'currency',
          currency: 'ARS',
        }).format(amount);
      };

      const generatePaymentMethodRows = (data: Record<string, number>) => {
        if (Object.keys(data).length === 0) {
          return '<tr><td colspan="2" class="empty-state">Sin movimientos</td></tr>';
        }
        return Object.entries(data)
          .map(
            ([method, amount]) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">${method}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #1f2937;">${formatCurrency(amount)}</td>
        </tr>
      `,
          )
          .join('');
      };

      const balance =
        reportData.totals.sales +
        reportData.totals.incomes -
        reportData.totals.expenses -
        reportData.totals.purchases;

      const balanceColor = balance >= 0 ? '#10b981' : '#ef4444';
      const balanceIcon = balance >= 0 ? '✅' : '⚠️';

      const htmlBody = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Resumen Diario - Distrify</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; }
        .email-container { max-width: 700px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 20px 40px rgba(0,0,0,0.1); border-radius: 20px; overflow: hidden; }
        .hero-header { padding: 50px 40px; text-align: center; color: black; }
        .hero-title { font-size: 32px; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.5px; }
        .hero-subtitle { font-size: 18px; opacity: 0.95; font-weight: 400; }
        .date-badge { background: rgba(0,0,0,0.05); padding: 10px 24px; border-radius: 50px; display: inline-block; font-weight: 500; border: 1px solid rgba(0,0,0,0.1); margin-top: 16px; font-size: 14px; }
        .content { padding: 40px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 40px; }
        .kpi-card { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #e2e8f0; }
        .kpi-label { font-size: 12px; font-weight: 500; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .kpi-value { font-size: 24px; font-weight: 700; color: #1e293b; }
        .balance-card { background: linear-gradient(135deg, ${balanceColor === '#10b981' ? '#ecfdf5' : '#fef2f2'} 0%, ${balanceColor === '#10b981' ? '#d1fae5' : '#fee2e2'} 100%); border: 2px solid ${balanceColor}; border-radius: 16px; padding: 32px; text-align: center; margin: 32px 0; }
        .balance-label { font-size: 16px; font-weight: 600; color: ${balanceColor === '#10b981' ? '#065f46' : '#991b1b'}; margin-bottom: 12px; }
        .balance-amount { font-size: 42px; font-weight: 800; color: ${balanceColor}; margin-bottom: 8px; }
        .balance-formula { font-size: 14px; color: ${balanceColor === '#10b981' ? '#047857' : '#dc2626'}; font-weight: 500; }
        .section { margin: 40px 0; }
        .section-title { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 20px; }
        .payment-table { width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 24px; }
        .payment-table thead { background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); }
        .payment-table th { padding: 16px; text-align: left; font-weight: 600; font-size: 14px; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
        .payment-table th:last-child { text-align: right; }
        .subsection { background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e2e8f0; }
        .empty-state { text-align: center; padding: 24px; color: #94a3b8; font-size: 14px; font-style: italic; }
        .footer { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 40px; text-align: center; color: white; }
        .footer-text { font-size: 16px; opacity: 0.9; margin-bottom: 16px; }
        .footer-disclaimer { font-size: 12px; color: rgba(255,255,255,0.7); margin-top: 24px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.2); }
        @media (max-width: 700px) {
          .email-container { margin: 0; border-radius: 0; }
          .hero-header { padding: 40px 24px; }
          .hero-title { font-size: 28px; }
          .content { padding: 32px 24px; }
          .kpi-grid { grid-template-columns: repeat(2, 1fr); }
          .balance-amount { font-size: 32px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="hero-header">
          <div class="hero-title">Resumen Diario</div>
          <div class="hero-subtitle">Distrify - Gestión & ecommerce</div>
          <div class="date-badge">${formattedDate}</div>
        </div>
        <div class="content">
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-label">Ventas</div>
              <div class="kpi-value">${formatCurrency(reportData.totals.sales)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Ingresos</div>
              <div class="kpi-value">${formatCurrency(reportData.totals.incomes)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Egresos</div>
              <div class="kpi-value">${formatCurrency(reportData.totals.expenses)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Compras</div>
              <div class="kpi-value">${formatCurrency(reportData.totals.purchases)}</div>
            </div>
          </div>
          <div class="balance-card">
            <div class="balance-label">${balanceIcon} Balance del Día</div>
            <div class="balance-amount">${formatCurrency(balance)}</div>
            <div class="balance-formula">(Ventas + Ingresos) - (Egresos + Compras)</div>
          </div>
          <div class="section">
            <div class="section-title">Ventas por Método de Pago</div>
            <div class="subsection">
              <table class="payment-table">
                <thead><tr><th>Método de Pago</th><th style="text-align:right;">Monto</th></tr></thead>
                <tbody>${generatePaymentMethodRows(reportData.salesByPaymentMethodTotals)}</tbody>
              </table>
            </div>
          </div>
          <div class="section">
            <div class="section-title">Ingresos por Método de Pago</div>
            <div class="subsection">
              <table class="payment-table">
                <thead><tr><th>Método de Pago</th><th style="text-align:right;">Monto</th></tr></thead>
                <tbody>${generatePaymentMethodRows(reportData.incomesByPaymentMethodTotals)}</tbody>
              </table>
            </div>
          </div>
          <div class="section">
            <div class="section-title">Egresos por Método de Pago</div>
            <div class="subsection">
              <table class="payment-table">
                <thead><tr><th>Método de Pago</th><th style="text-align:right;">Monto</th></tr></thead>
                <tbody>${generatePaymentMethodRows(reportData.expensesByPaymentMethodTotals)}</tbody>
              </table>
            </div>
          </div>
          <div class="section">
            <div class="section-title">Compras por Método de Pago</div>
            <div class="subsection">
              <table class="payment-table">
                <thead><tr><th>Método de Pago</th><th style="text-align:right;">Monto</th></tr></thead>
                <tbody>${generatePaymentMethodRows(reportData.purchasesByPaymentMethodTotals)}</tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="footer">
          <div class="footer-text">Este es tu resumen automático diario de Distrify. ¡Que tengas un excelente día!</div>
          <div class="footer-disclaimer">© 2025 Distrify. Sistema de Gestión de Negocios.</div>
        </div>
      </div>
    </body>
    </html>
  `;

      const { error } = await this.resend.emails.send({
        from: this.from,
        to,
        subject,
        html: htmlBody,
      });

      if (error) throw new Error(error.message);

      return { success: true, message: 'Email de resumen diario enviado correctamente' };
    } catch (error) {
      this.logger.error('Error enviando email de resumen diario:', error);
      throw new Error('Error al enviar el email de resumen diario');
    }
  }

  //?Enviar email de prueba expirada
  async sendTrialExpiredEmail(to: string, userName?: string) {
    try {
      const subject = 'Tu período de prueba en Distrify ha finalizado';

      const htmlBody = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Período de prueba finalizado - Distrify</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; }
          .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-radius: 16px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center; color: white; }
          .logo { font-size: 32px; font-weight: 700; margin-bottom: 8px; }
          .header-subtitle { font-size: 16px; opacity: 0.9; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 20px; font-weight: 600; color: #1f2937; margin-bottom: 20px; }
          .message { font-size: 16px; color: #4b5563; margin-bottom: 24px; line-height: 1.7; }
          .highlight-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 24px 0; }
          .highlight-text { font-size: 15px; color: #92400e; font-weight: 500; }
          .button-container { text-align: center; margin: 32px 0; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(139,92,246,0.3); }
          .footer { background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
          .footer-text { font-size: 14px; color: #64748b; margin-bottom: 10px; }
          .disclaimer { font-size: 12px; color: #94a3b8; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo">Distrify</div>
            <div class="header-subtitle">Sistema de Gestión de Negocios</div>
          </div>
          <div class="content">
            <div class="greeting">Hola${userName ? ` ${userName}` : ''},</div>
            <div class="message">
              Tu período de prueba gratuito de <strong>7 días</strong> en Distrify ha finalizado.
              Esperamos que hayas podido conocer todas las herramientas que tenemos para vos.
            </div>
            <div class="highlight-box">
              <div class="highlight-text">
                ⏰ Tu acceso al sistema se ha bloqueado temporalmente. Para seguir gestionando tu negocio,
                necesitás activar un plan premium.
              </div>
            </div>
            <div class="message">
              Con un plan premium podés acceder a todas las funcionalidades de Distrify:
              ventas, inventario, reportes, caja, pedidos y mucho más, sin interrupciones.
            </div>
            <div class="button-container">
              <a href="${this.frontendUrl}/planes" class="cta-button">Ver planes y precios</a>
            </div>
            <div class="message" style="font-size:14px; color:#6b7280;">
              ¿Tenés dudas? Respondé este correo y con gusto te ayudamos.
            </div>
          </div>
          <div class="footer">
            <div class="footer-text">Saludos cordiales,<br><strong>Equipo de Distrify</strong></div>
            <div class="disclaimer">Este correo fue enviado automáticamente.</div>
          </div>
        </div>
      </body>
      </html>
    `;

      const { error } = await this.resend.emails.send({
        from: this.from,
        to,
        subject,
        html: htmlBody,
      });

      if (error) throw new Error(error.message);

      return { success: true, message: 'Email de prueba expirada enviado correctamente' };
    } catch (error) {
      this.logger.error('Error enviando email de prueba expirada:', error);
      throw new Error('Error al enviar el email de prueba expirada');
    }
  }
}
