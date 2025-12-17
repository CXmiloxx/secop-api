import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { appConfig } from './config/app.config';
import { HttpExceptionFilter, LoggingInterceptor } from './common';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import session from 'express-session';

config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Session configuration
  app.use(
    session({
      secret: appConfig.sessionSecret || 'your-session-secret-change-in-production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: appConfig.isProduction,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
      },
    }),
  );

  // Cookie parser
  app.use(cookieParser());

  // Enable CORS with credentials
  app.enableCors({
    origin: appConfig.urlFrontend || 'http://localhost:3000',
    credentials: true,
  });

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(appConfig.port);
  console.log(`🚀 Application is running on: http://localhost:${appConfig.port}`);
}

void bootstrap();
