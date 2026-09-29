import * as nodeCrypto from 'crypto';

// Polyfill global crypto para Node < 18.19 (requerido por @nestjs/schedule)
if (!globalThis.crypto) {
  (globalThis as any).crypto = nodeCrypto;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import { join } from 'path';
import * as fs from 'fs';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Límite explícito de tamaño de body para prevenir ataques de large payload
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const configService = app.get(ConfigService);
  app.useGlobalFilters(new GlobalExceptionFilter(configService));
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Servir archivos subidos localmente
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  const isDesktop = configService.get<boolean>('DESKTOP_MODE') === true ||
                    configService.get<string>('DESKTOP_MODE') === 'true';

  const defaultOrigins = isDesktop
    ? ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'file://']
    : ['http://localhost:5173'];

  const allowedOrigins = (process.env.CORS_ORIGINS || defaultOrigins.join(','))
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: isDesktop ? true : allowedOrigins,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Health check endpoint para UptimeRobot y Electron desktop
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/health', (req: any, res: any) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // En modo Desktop, servir el frontend compilado (Vue SPA)
  if (isDesktop) {
    const candidatePaths = [
      process.env.FRONT_DIST_PATH,
      join(process.cwd(), 'front-dist'),
      join(process.cwd(), '..', 'front', 'dist'),
      join(process.cwd(), 'front', 'dist'),
    ];
    const resolvedFrontPath = candidatePaths.find((p) => p && fs.existsSync(p));

    if (resolvedFrontPath) {
      app.useStaticAssets(resolvedFrontPath);
      // Fallback para Vue Router (HTML5 History Mode)
      httpAdapter.get('*', (req: any, res: any, next: any) => {
        const url = req.url || '';
        if (
          url.startsWith('/uploads') ||
          url.startsWith('/health') ||
          url.includes('.')
        ) {
          return next();
        }
        res.sendFile(join(resolvedFrontPath, 'index.html'));
      });
    }
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
