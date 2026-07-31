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

  @IsString()
  MONGO_DB_URI: string;

  @IsString()
  MONGO_DB_NAME: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  ENCRYPTION_KEY: string;

  @IsString()
  FRONTEND_URL: string;

  @IsString()
  RESEND_API_KEY: string;

  @IsString()
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
