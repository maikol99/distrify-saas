import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Request,
  Get,
  Query,
  Patch,
  Res,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterUserDto } from '../users/dtos/users.dto';
import { Public } from 'src/decorators/public.decorator';
import { ConfigService } from '@nestjs/config';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El email no es válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @IsString({ message: 'La contraseña debe ser texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
}

export class UpdatePasswordDto {
  @IsString({ message: 'La nueva contraseña debe ser texto' })
  @IsNotEmpty({ message: 'La nueva contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  newPassword: string;

  @IsString({ message: 'El código de reinicio debe ser texto' })
  @IsNotEmpty({ message: 'El código de reinicio es obligatorio' })
  resetCode: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}


  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/post/verify-google-user')
  async verifyGoogleUser(@Body('token') token: string) {
    return this.authService.veryfyGoogleUser(token);
  }

  //?Login o registro automático con Google
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('/post/login-google')
  async loginWithGoogle(@Body('token') token: string, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.loginWithGoogle(token);

    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    const expiresInMs = (result.expires_in || 28800) * 1000;

    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: expiresInMs,
      path: '/',
    });

    const { access_token: _, ...safeResult } = result;
    return safeResult;
  }

  //? Crear usuario de google (deshabilitado — registro solo por administrador)
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('/post/create-google-user')
  async createGoogleUser(@Body() body: any) {
    throw new ForbiddenException('El registro público está deshabilitado. Contactá al administrador para obtener acceso.');
  }



  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('post/login-user')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    const result = await this.authService.login(user);

    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    const expiresInMs = (result.expires_in || 28800) * 1000;

    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: expiresInMs,
      path: '/',
    });

    // No devolver el token en el body — el cliente lo recibe solo via cookie
    const { access_token: _, ...safeResult } = result;
    return safeResult;
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('/post/register-user')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: RegisterUserDto) {
    return this.authService.register(createUserDto);
  }


  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Request() req, @Res({ passthrough: true }) res: Response) {
    const token = req?.cookies?.['access_token'] || req?.headers?.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }
    const result = await this.authService.refreshExpiredToken(token);

    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    const expiresInMs = (result.expires_in || 28800) * 1000;

    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: expiresInMs,
      path: '/',
    });

    const { access_token: _, ...safeResult } = result;
    return safeResult;
  }

  //Reenviar token de verificacion
  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('/post/resend-verification-token')
  @HttpCode(HttpStatus.OK)
  async resendVerificationToken(@Query('email') email: string) {
    return this.authService.resendVerificationToken(email);
  }

  @Get('profile')
  async getProfile(@Request() req) {
    return {
      user: req.user,
    };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
    // Intentar incrementar tokenVersion si hay token válido, pero siempre limpiar la cookie
    try {
      const token = req.cookies?.['access_token'];
      if (token) {
        const secret = this.configService.get<string>('JWT_SECRET');
        const jwt = await import('jsonwebtoken');
        const payload: any = jwt.decode(token);
        if (payload?.sub) {
          await this.authService.incrementTokenVersion(payload.sub);
        }
      }
    } catch (_) {}
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    res.clearCookie('access_token', {
      path: '/',
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    });
    return { message: 'Sesión cerrada exitosamente' };
  }

  //?Enviar codigo de recuperaicon de contrasñea
  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('post/generate-password-reset-code')
  @HttpCode(HttpStatus.OK)
  async generatePasswordResetCode(@Query('email') email: string) {
    return this.authService.generatePasswordResetCode(email);
  }

  //?Actualizar contraseña con el código de recuperación
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Patch('/patch/update-password')
  @HttpCode(HttpStatus.OK)
  async updatePassword(@Body() dto: UpdatePasswordDto) {
    return this.authService.updatePassword(dto.newPassword, dto.resetCode);
  }

  //?Validar codigo de verificación de correo electrónico
  @Public()
  @Post('/post/verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Query('code') code: string) {
    return this.authService.validateVerificationCode(code);
  }

  //?Verificar codigo de recuperación de contraseña
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('/post/verify-password-reset-code')
  @HttpCode(HttpStatus.OK)
  async verifyPasswordResetCode(@Query('resetCode') resetCode: string) {
    return this.authService.verifyPasswordResetToken(resetCode);
  }
}
