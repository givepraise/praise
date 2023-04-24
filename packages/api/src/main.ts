import * as fs from 'fs';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { version } from '../package.json';

import { AppModule } from './app.module';
import { AppConfig } from './shared/appConfig.shared';
import { envCheck } from './shared/env.shared';
import { logger } from './shared/logger';
import { ServiceExceptionFilter } from './shared/filters/service-exception.filter';
import { MongoValidationErrorFilter } from './shared/filters/mongo-validation-error.filter';
import { MongoServerErrorFilter } from './shared/filters/mongo-server-error.filter';
import { MultiTenancyManager } from './database/multi-tenancy-manager';
import { MigrationsManager } from './database/migrations-manager';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { isDocker } from './shared/isDocker';

async function bootstrap() {
  // Check that all required ENV variables are set
  envCheck();

  // The multi-tenancy manager makes sure that every community has a database
  // and that the database has the correct collections and indexes. If Praise
  // is upgraded from a single-tenant version, the multi-tenancy manager will
  // also migrate the data from the single database to the multi-tenant setup.
  const multiTenancyManager = new MultiTenancyManager();
  await multiTenancyManager.run();

  // The migrations manager runs the database migrations for each community
  // database.
  const migrationsManager = new MigrationsManager();
  await migrationsManager.run();

  // Create an instance of the Nest app
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    AppConfig,
  );

  // Apply dependency injection container to the app
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Set the global prefix for all routes in the app
  app.setGlobalPrefix('api/');

  // Apply global validation pipes to request data
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      // forbidUnknownValues: true,
      // skipMissingProperties: false,
    }),
  );

  // Apply global exception filters to handle errors in the app
  // ServiceExceptions are turned into HTTP 400 Bad Request responses
  app.useGlobalFilters(new MongoServerErrorFilter());
  app.useGlobalFilters(new MongoValidationErrorFilter());
  app.useGlobalFilters(new ServiceExceptionFilter());

  // Serve static files from the upload folder
  const uploadsPath = isDocker()
    ? '/usr/src/uploads/'
    : join(__dirname, '../../uploads');
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads',
  });

  // If in development mode, generate and serve OpenAPI documentation
  if (process.env.NODE_ENV === 'development') {
    // Create OpenAPI configuration
    const openApiConfig = new DocumentBuilder().setTitle('Praise API').build();

    // Generate OpenAPI documentation
    const openApiDocument = SwaggerModule.createDocument(app, openApiConfig);

    // Write OpenAPI documentation to file
    fs.writeFileSync('./openapi.json', JSON.stringify(openApiDocument));

    // Serve OpenAPI documentation at /docs
    SwaggerModule.setup('docs', app, openApiDocument);
  }

  // Enable CORS for all origins
  app.enableCors({
    origin: '*',
  });

  // Start the app listening on the API port or default to port 3000
  await app.listen(process.env.API_PORT || 3000);

  // Log the app version and port to the console
  logger.info(
    `Praise API v${version} listening on port ${process.env.API_PORT || 3000}`,
  );
}

bootstrap();
