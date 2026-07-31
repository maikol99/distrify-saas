import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from '../users/users.schema';
import { Model } from 'mongoose';
import { RegisterUserDto } from '../users/dtos/users.dto';
import { EmailsService } from '../emails/emails.service';
import * as jwt from 'jsonwebtoken';
import { Shops } from '../shops/shops.schema';
import { OAuth2Client } from 'google-auth-library';
import { PlanLimitsService } from '../plan-limits/plan-limits.service';
export interface LoginResponse {
  user: {
    id: string;
    username: string;
    email: string;
    shopId: string;
    routesAllowed: string[];
    isAdmin: boolean;
  };
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(Users.name) private usersModel: Model<Users>,
    @InjectModel(Shops.name) private shopsModel: Model<Shops>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailsService: EmailsService,
    private planLimitsService: PlanLimitsService,
  ) {}

  //?Validar datos de auth de google
  async veryfyGoogleUser(token: string) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: clientId,
    });
    const payload: any = ticket.getPayload();

    if (!payload) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    return {
      success: true,
      id: payload['sub'],
      email: payload['email'],
      name: payload['name'],
    };
  }

  //?Login o registro automático con Google
  async loginWithGoogle(token: string): Promise<LoginResponse> {
    let payload: any;
    try {
      const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
      const client = new OAuth2Client(clientId);
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: clientId,
      });
      payload = ticket.getPayload();
    } catch (error) {
      this.logger.error(`Error al verificar token de Google: ${error.message}`);
      throw new UnauthorizedException('Token de Google inválido o expirado');
    }

    if (!payload) {
      throw new UnauthorizedException('Token de Google inválido o expirado');
    }

    const googleEmail = payload['email'].toLowerCase().trim();
    const googleId = payload['sub'];
    const googleName = payload['name'] || googleEmail.split('@')[0];

    // 2. Buscar si el usuario ya existe
    let user = await this.usersModel
      .findOne({ email: googleEmail })
      .select('+password')
      .exec();

    // 3. Si no existe, crearlo automáticamente
    if (!user) {
      const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 12);
      const hashedPassword = await bcrypt.hash(googleId, Number(saltRounds));

      const newShop = new this.shopsModel({
        name: 'Mi Nuevo Negocio',
        email: googleEmail,
        isFirstLogin: true,
        isCentral: true,
      });
      const savedShop = await newShop.save();

      const newUser = new this.usersModel({
        username: googleName,
        email: googleEmail,
        password: hashedPassword,
        isEmailVerified: true,
        lastLogin: new Date(),
        shopId: savedShop._id,
        role: 'ADMIN',
        trialStartDate: new Date(),
        isPremium: false,
        createdAt: new Date(),
      });
      user = await newUser.save();
    }

    // 4. Generar JWT y retornar sesión
    const userObj = user.toObject();
    const { password: _, ...safeUser } = userObj as any;

    return this.login(safeUser);
  }

  //?Crear usuario de google
  async createGoogleUser(googleUser: any) {
    const { email, username, id } = googleUser;

    // Verificar si el usuario ya existe
    const userExists = await this.usersModel.findOne({ email });
    if (userExists) {
      throw new ConflictException('El usuario ya existe');
    }

    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 12);
    const hashedPassword = await bcrypt.hash(id, Number(saltRounds));
    const newShop = new this.shopsModel({
      name: `Negocio de ${username}'`,
      isFirstLogin: true,
      isCentral: true,
    });

    await newShop.save();

    // Crear nuevo usuario
    const newUser = await this.usersModel.create({
      username: username,
      email,
      password: hashedPassword,
      isEmailVerified: true,
      lastLogin: new Date(),
      shopId: newShop._id.toString(),
    });

    if (!newUser) {
      throw new Error('Error al crear el usuario');
    }

    return {
      success: true,
      message: 'Usuario creado correctamente',
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.usersModel
        .findOne({ email: email.toLowerCase().trim() })
        .select('+password')
        .exec();

      if (!user) {
        throw new UnauthorizedException('Credenciales incorrectas');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciales incorrectas');
      }

      // Verificar si el usuario está activo

      // Remover password del objeto
      const { password: _, ...result } = user.toObject();
      return result;
    } catch (error) {
      this.logger.error(`Error validating user: ${error.message}`);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Error de validación');
    }
  }

  //Logear usuario
  async login(user: any): Promise<LoginResponse> {
    try {
      // Verificar que el email esté verificado
      if (!user.isEmailVerified) {
        throw new UnauthorizedException(
          'Debes verificar tu correo electrónico antes de iniciar sesión. Revisá tu bandeja de entrada.',
        );
      }

      // Verificar trial de 7 días (solo para usuarios no premium)
      if (!user.isPremium && user.trialStartDate) {
        const trialDays = 7;
        const trialEnd = new Date(user.trialStartDate);
        trialEnd.setDate(trialEnd.getDate() + trialDays);
        if (new Date() > trialEnd) {
          throw new UnauthorizedException(
            'Tu período de prueba de 7 días ha finalizado. Actualizá tu plan para continuar usando Alevia Pay.',
          );
        }
      }

      const superAdminId = this.configService.get<string>('SUPER_ADMIN_ID');
      const isAdmin = user._id.toString() === superAdminId;

      const payload = {
        username: user.username,
        email: user.email,
        sub: user._id.toString(),
        shopId: user.shopId?.toString(),
        tokenVersion: user.tokenVersion || 0,
        isAdmin,
      };

      const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '8h');
      const access_token = this.jwtService.sign(payload, { expiresIn });

      await this.usersModel.findByIdAndUpdate(
        user._id,
        { lastLogin: new Date() },
        { new: true },
      );

      await this.shopsModel.findByIdAndUpdate(
        user.shopId,
        { lastLogin: new Date() },
        { new: true },
      );

      return {
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          shopId: user.shopId,
          routesAllowed: user.routesAllowed,
          isAdmin,
        },
        access_token,
        expires_in: this.parseExpirationTime(expiresIn),
        token_type: 'Bearer',
      };
    } catch (error) {
      this.logger.error(`Login error: ${error.message}`);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Error al iniciar sesión');
    }
  }

  //Registro de usuario
  async register(createUserDto: RegisterUserDto): Promise<RegisterResponse> {
    const session = await this.usersModel.db.startSession();

    try {
      session.startTransaction();

      const { username, password, email } = createUserDto;
      const trimmedUsername = username.trim();
      const lowerCaseEmail = email.toLowerCase().trim();

      // Validaciones
      await this.validateRegistrationData(
        trimmedUsername,
        lowerCaseEmail,
        password,
      );

      // Verificar duplicados en una sola consulta dentro de la transacción
      const existingUser = await this.usersModel
        .findOne({
          $or: [{ email: lowerCaseEmail }, { username: trimmedUsername }],
        })
        .session(session);

      if (existingUser) {
        await session.abortTransaction();
        session.endSession();

        if (existingUser.email === lowerCaseEmail) {
          return {
            success: false,
            message: 'El correo electrónico ya está registrado',
          };
        }
        return {
          success: false,
          message: 'El nombre de usuario ya existe',
        };
      }

      // Verificar límite de usuarios del plan (solo al agregar usuario a un negocio existente)
      if (createUserDto.createShop === false) {
        await this.planLimitsService.checkUserLimit(createUserDto.shopId);
      }

      //Crear negocio
      let savedShop = null;
      if (createUserDto.createShop === true) {
        const newShop = new this.shopsModel({
          name: 'Mi Nuevo Negocio',
          email: lowerCaseEmail,
          isFirstLogin: true,
          isCentral: true,
        });
        savedShop = await newShop.save({ session });
      }

      // Crear usuario
      const hashedPassword = await this.hashPassword(password);
      const token = this.generateValidationToken({ email: lowerCaseEmail });
      const verificationTokenExpiresIn = new Date(Date.now() + 3600000);

      const newUser = new this.usersModel({
        ...createUserDto,
        username: trimmedUsername,
        email: lowerCaseEmail,
        password: hashedPassword,
        role: 'ADMIN',
        createdAt: new Date(),
        lastLogin: new Date(),
        verificationToken: token,
        isEmailVerified: false,
        verificationTokenExpires: verificationTokenExpiresIn,
        phone: createUserDto.phone || null,
        shopId: createUserDto.createShop === true ? savedShop._id : createUserDto.shopId,
        trialStartDate: new Date(),
        isPremium: false,
      });

      const savedUser = await newUser.save({ session });

      const sentEmail = await this.emailsService.sendEmailVerificationToken(
        lowerCaseEmail,
        token,
      );

      if (!sentEmail) {
        this.logger.error('Error al enviar email de verificación');
      }

      await session.commitTransaction();
      session.endSession();

      return {
        success: true,
        message: 'Usuario creado correctamente',
        user: {
          id: savedUser._id.toString(),
          username: savedUser.username,
          email: savedUser.email,
        },
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      this.logger.error(`Registration error: ${error.message}`);

      // Manejo específico para errores de MongoDB
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        const message =
          field === 'email'
            ? 'El correo electrónico ya está registrado'
            : 'El nombre de usuario ya existe';
        return {
          success: false,
          message,
        };
      }

      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new BadRequestException('Error al crear usuario');
    }
  }

  //Reenviar token de verificacion
  async resendVerificationToken(email: string) {
    const session = await this.usersModel.db.startSession();
    session.startTransaction();
    try {
      const user = await this.usersModel.findOne({ email }).session(session);

      if (!user) {
        throw new BadRequestException('Usuario no encontrado');
      } else if (user.isEmailVerified) {
        return { success: false, message: 'El email ya está verificado' };
      }

      const token = this.generateValidationToken({ email });
      const verificationTokenExpiresIn = new Date(Date.now() + 3600000);

      user.verificationToken = token;
      user.verificationTokenExpires = verificationTokenExpiresIn;

      await user.save({ session });
      await this.emailsService.sendEmailVerificationToken(email, token);

      await session.commitTransaction();
      session.endSession();

      return {
        success: true,
        message: 'Token de verificación reenviado correctamente',
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      this.logger.error(`Resend token error: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al reenviar token de verificación');
    }
  }

  async refreshToken(userId: string): Promise<{ access_token: string; expires_in: number }> {
    try {
      const user = await this.usersModel.findById(userId).select('-password');

      const superAdminId = this.configService.get<string>('SUPER_ADMIN_ID');
      const isAdmin = user._id.toString() === superAdminId;

      const payload = {
        username: user.username,
        email: user.email,
        sub: user._id.toString(),
        shopId: user.shopId?.toString(),
        tokenVersion: user.tokenVersion || 0,
        isAdmin,
      };

      const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '8h');

      return {
        access_token: this.jwtService.sign(payload, { expiresIn }),
        expires_in: this.parseExpirationTime(expiresIn),
      };
    } catch (error) {
      this.logger.error(`Token refresh error: ${error.message}`);
      throw new UnauthorizedException('Error al renovar token');
    }
  }

  async refreshExpiredToken(token: string): Promise<{ access_token: string; expires_in: number }> {
    try {
      const payload = this.jwtService.verify(token, {
        ignoreExpiration: true,
      });
      if (!payload || !payload.sub) {
        throw new UnauthorizedException('Token inválido');
      }
      return this.refreshToken(payload.sub);
    } catch (error) {
      this.logger.error(`Expired token refresh error: ${error.message}`);
      throw new UnauthorizedException('Token inválido o firma incorrecta');
    }
  }

  async incrementTokenVersion(userId: string): Promise<void> {
    await this.usersModel.findByIdAndUpdate(userId, {
      $inc: { tokenVersion: 1 },
    });
  }

  private async validateRegistrationData(
    username: string,
    email: string,
    password: string,
  ): Promise<void> {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&.]{8,}$/;

    const usernameRegex = /^[a-zA-Z0-9._-]{3,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!usernameRegex.test(username)) {
      throw new BadRequestException(
        'El nombre de usuario debe tener al menos 3 caracteres y solo puede contener letras, números, puntos, guiones bajos y guiones.',
      );
    }

    if (!emailRegex.test(email)) {
      throw new BadRequestException('El email no tiene un formato válido');
    }

    if (!passwordRegex.test(password)) {
      throw new BadRequestException(
        'La contraseña debe tener al menos 8 caracteres y contener al menos una letra, un número y puede incluir caracteres especiales.',
      );
    }
  }

  private async checkUserExists(
    username: string,
    email: string,
  ): Promise<void> {
    const [existingUser, existingEmail] = await Promise.all([
      this.usersModel.findOne({ username }).lean(),
      this.usersModel.findOne({ email }).lean(),
    ]);

    if (existingUser) {
      throw new ConflictException('El nombre de usuario ya existe');
    }

    if (existingEmail) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 12);
    return bcrypt.hash(password, Number(saltRounds));
  }

  private parseExpirationTime(expiresIn: string): number {
    // Convertir "8h", "30m", "7d" a segundos
    const timeMap = { s: 1, m: 60, h: 3600, d: 86400 };
    const match = expiresIn.match(/^(\d+)([smhd])$/);

    if (!match) return 28800; // 8 horas por defecto

    const [, value, unit] = match;
    return parseInt(value) * timeMap[unit as keyof typeof timeMap];
  }

  //? Generar JWT
  private generateValidationToken(payload: any) {
    try {
      const secretKey = this.configService.get<string>('JWT_SECRET');
      const expiresIn = '1h';

      const token = jwt.sign(payload, secretKey, { expiresIn });
      return token;
    } catch (error) {
      throw error;
    }
  }

  //?Validar REGISTRO
  async validateVerificationCode(code: string) {
    const session = await this.usersModel.db.startSession();
    session.startTransaction();
    try {
      if (!code) {
        throw new BadRequestException('Código de verificación es requerido');
      }

      const user = await this.usersModel.findOne({
        verificationToken: code,
        verificationTokenExpires: { $gt: new Date() },
      });

      if (!user) {
        throw new BadRequestException('Usuario no encontrado');
      }

      if (!user.verificationToken) {
        throw new BadRequestException(
          'El usuario no tiene un código de verificación',
        );
      }

      if (user.verificationToken !== code) {
        throw new BadRequestException('Código de verificación incorrecto');
      }

      user.verificationToken = null;
      user.isEmailVerified = true;
      user.verificationTokenExpires = null;

      await user.save({ session });
      await session.commitTransaction();
      session.endSession();
      return {
        success: true,
        message: 'Email verificado correctamente',
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  // ? Generar código de recuperación de contraseña
  async generatePasswordResetCode(email: string) {
    const session = await this.usersModel.db.startSession();
    session.startTransaction();
    try {
      const user = await this.usersModel.findOne({
        email: email.toLowerCase().trim(),
      });

      if (!user) {
        throw new BadRequestException('Usuario no encontrado');
      }

      const resetCode = this.generateValidationToken({ email });
      user.passwordResetToken = resetCode;
      user.passwordResetTokenExpires = new Date(Date.now() + 3600000);

      await this.emailsService.sendPasswordResetEmail(email, resetCode);

      await user.save({ session });
      await session.commitTransaction();
      session.endSession();
      return {
        success: true,
        message: 'Código de recuperación generado correctamente',
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  // ? Actualizar contraseña
  async updatePassword(newPassword: string, resetCode: string) {
    const session = await this.usersModel.db.startSession();
    session.startTransaction();
    try {
      const user = await this.usersModel.findOne({
        passwordResetToken: resetCode,
        passwordResetTokenExpires: { $gt: new Date() }, // Token no expirado
      });

      if (!user) {
        throw new BadRequestException('Token inválido o expirado');
      }

      // Actualizar contraseña
      user.password = await this.hashPassword(newPassword);

      // Invalidar token para que no se reutilice
      user.passwordResetToken = null;
      user.passwordResetTokenExpires = null;

      await user.save({ session });
      await session.commitTransaction();
      session.endSession();

      return {
        success: true,
        message: 'Contraseña actualizada correctamente',
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  //?Verificar codigo de ACTUALIZACION de contraseña
  async verifyPasswordResetToken(resetCode: string) {
    const user = await this.usersModel.findOne({
      passwordResetToken: resetCode,
    });

    if (!user) {
      return { success: false, message: 'Token inválido' };
    }

    if (user.passwordResetTokenExpires <= new Date()) {
      return { success: false, message: 'Token expirado' };
    }

    return { success: true };
  }
}
