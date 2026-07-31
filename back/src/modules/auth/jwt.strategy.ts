import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Users } from '../users/users.schema';

export interface JwtPayload {
  sub: string;
  username: string;
  email: string;
  shopId?: string;
  tokenVersion?: number;
  isAdmin?: boolean;
  iat: number;
  exp: number;
  iss?: string;
  aud?: string;
}

export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  shopId: string;
  routesAllowed: string[];
  isAdmin: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(Users.name) private usersModel: Model<Users>,
    private configService: ConfigService,
  ) {
    super({
      // Acepta token desde cookie HttpOnly o desde header Authorization: Bearer
      jwtFromRequest: (req) => {
        const fromCookie = req?.cookies?.['access_token'];
        if (fromCookie) return fromCookie;
        return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      },
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      issuer: configService.get<string>('JWT_ISSUER', 'your-app-name'),
      audience: configService.get<string>('JWT_AUDIENCE', 'your-app-users'),
      passReqToCallback: false,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    try {
      const user = await this.usersModel
        .findById(payload.sub)
        .select('-password')
        .lean()
        .exec();

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      if (typeof payload.tokenVersion === 'number' && user.tokenVersion !== payload.tokenVersion) {
        throw new UnauthorizedException('Token revocado');
      }

      if (!user.isEmailVerified) {
        throw new UnauthorizedException(
          'Debes verificar tu correo electrónico antes de usar el sistema.',
        );
      }

      if (!user.isPremium && user.trialStartDate) {
        const trialEnd = new Date(user.trialStartDate);
        trialEnd.setDate(trialEnd.getDate() + 7);
        if (new Date() > trialEnd) {
          throw new UnauthorizedException(
            'Tu período de prueba de 7 días ha finalizado. Actualizá tu plan para continuar usando Alevia Pay.',
          );
        }
      }

      return {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        // Preferir shopId del payload (firmado) para ahorrar DB queries y garantizar integridad
        shopId: payload.shopId ?? user.shopId?.toString(),
        routesAllowed: user.routesAllowed || [],
        isAdmin: payload.isAdmin === true,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Error de validación del token');
    }
  }
}
