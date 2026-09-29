import { plainToInstance } from 'class-transformer';
import { validateSync, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  PORT: number = 3000;

  @IsOptional()
  DESKTOP_MODE: boolean = false;

  @IsString()
  @IsOptional()
  MONGO_DB_URI: string;

  @IsString()
  @IsOptional()
  MONGO_DB_NAME: string;

  @IsString()
  @IsOptional()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  ENCRYPTION_KEY: string;

  @IsString()
  @IsOptional()
  FRONTEND_URL: string;

  @IsString()
  @IsOptional()
  RESEND_API_KEY: string;

  @IsString()
  @IsOptional()
  EMAIL_FROM: string;

  // ─── Plan Limits (con defaults seguros) ────────────────────────────────────
  @IsNumber()
  @IsOptional()
  PLAN_FREE_MAX_PRODUCTS: number = 20;

  @IsNumber()
  @IsOptional()
  PLAN_FREE_MAX_USERS: number = 1;

  @IsNumber()
  @IsOptional()
  PLAN_BASIC_MAX_USERS: number = 2;

  @IsNumber()
  @IsOptional()
  PLAN_MEDIUM_MAX_USERS: number = 3;
}

export function validate(config: Record<string, any>) {
  const isDesktop = config.DESKTOP_MODE === 'true' || config.DESKTOP_MODE === true;

  // Inyectar defaults seguros para modo offline si no están presentes
  if (isDesktop) {
    config.MONGO_DB_URI = config.MONGO_DB_URI || 'mongodb://127.0.0.1:27017';
    config.MONGO_DB_NAME = config.MONGO_DB_NAME || 'alevia_desktop';
    config.JWT_SECRET = config.JWT_SECRET || 'alevia_desktop_offline_jwt_secret_key_2026';
    config.ENCRYPTION_KEY = config.ENCRYPTION_KEY || 'alevia_desktop_enc_key_32chars!';
    config.FRONTEND_URL = config.FRONTEND_URL || 'http://localhost:3000';
    config.RESEND_API_KEY = config.RESEND_API_KEY || 'desktop_offline_resend_mock';
    config.EMAIL_FROM = config.EMAIL_FROM || 'soporte@alevia.local';
    config.DESKTOP_MODE = true;
  }

  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    config,
    { enableImplicitConversion: true },
  );
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(
      `\n❌ Error de validacion en las Variables de Entorno (.env):\n` +
      errors.map(err => {
        const constraints = Object.values(err.constraints || {}).join(', ');
        return `  - ${err.property}: ${constraints}`;
      }).join('\n')
    );
  }
  return validatedConfig;
}
