import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { ServiceExceptionFilter } from './shared/filters/service-exception.filter';
import { runDbMigrations } from './database/migrations';
import { version } from '../package.json';
import { Logger } from './shared/logger';
import { MongoValidationErrorFilter } from './shared/filters/mongo-validation-error.filter';
import { MongoServerErrorFilter } from './shared/filters/mongo-server-error.filter';
import { envCheck } from './shared/env.shared';
import * as fs from 'fs';
import { AppMigrationsModule } from './database/app.migrations.module';

async function bootstrap() {
  // Check that all required ENV variables are set
  envCheck();

  // Run database migrations before starting the app
  const appMigrations = await NestFactory.create(AppMigrationsModule);
  await runDbMigrations(appMigrations, new Logger('Migrations'));

  // Create an instance of the Nest app
  const app = await NestFactory.create(AppModule);

  // Set the global prefix for all routes in the app
  app.setGlobalPrefix('api/');

  // Apply global validation pipes to request data
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      //forbidUnknownValues: true, //TODO: Enabling this causes an error in the validation pipe - Investigate!
    }),
  );

  // Apply global exception filters to handle errors in the app
  // ServiceExceptions are turned into HTTP 400 Bad Request responses
  app.useGlobalFilters(new MongoServerErrorFilter());
  app.useGlobalFilters(new MongoValidationErrorFilter());
  app.useGlobalFilters(new ServiceExceptionFilter());

  // Apply dependency injection container to the app
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

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

  // Create a logger instance for the app
  const logger = new Logger('Bootstrap');

  // Start the app listening on the API port or default to port 3000
  await app.listen(process.env.API_PORT || 3000);

  // Log the app version and port to the console
  logger.log(
    `Praise API v${version} listening on port ${process.env.API_PORT || 3000}`,
  );
}

bootstrap();
