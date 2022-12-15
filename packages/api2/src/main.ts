import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { ServiceExceptionFilter } from './shared/service-exception.filter';
import { runDbMigrations } from './database/run-db-migrations';

async function bootstrap() {
  // Create an instance of the Nest app
  const app = await NestFactory.create(AppModule);

  // Set the global prefix for all routes in the app
  app.setGlobalPrefix('api/');

  // Apply global validation pipes to request data
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  // Apply global exception filters to handle errors in the app
  // ServiceExceptions are turned into HTTP 400 Bad Request responses
  app.useGlobalFilters(new ServiceExceptionFilter());

  // Apply dependency injection container to the app
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Create Swagger configuration
  const config = new DocumentBuilder().setTitle('Praise API').build();

  // Generate Swagger documentation based on the app modules and controllers
  const document = SwaggerModule.createDocument(app, config);

  // Setup Swagger endpoint and documentation
  SwaggerModule.setup('docs', app, document);

  // Enable CORS for all origins
  app.enableCors({
    origin: '*',
  });

  // Run database migrations before starting the app
  await runDbMigrations(app);

  // Start the app listening on the API port or default to port 3000
  await app.listen(process.env.API_PORT || 3000);
}

bootstrap();
