import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { ServiceExceptionFilter } from './shared/service-exception.filter';
import { setupMigrator } from './database/migration';
import { connectDatabase } from './database/connection';
import { PraiseService } from './praise/praise.service';
import { UsersService } from './users/users.service';
import { PeriodsService } from './periods/periods.service';
import { SettingsService } from './settings/settings.service';
import { UtilsProvider } from './utils/utils.provider';
import { PeriodSettingsService } from './periodsettings/periodsettings.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalFilters(new ServiceExceptionFilter());

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const config = new DocumentBuilder().setTitle('Praise API').build();
  const document = SwaggerModule.createDocument(app, config);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  SwaggerModule.setup('docs', app, document);

  app.enableCors({
    origin: '*',
  });

  const db = await connectDatabase('localhost');
  const migrator = setupMigrator(db.connection, {
    praiseService: app.get(PraiseService),
    usersService: app.get(UsersService),
    periodsService: app.get(PeriodsService),
    settingsService: app.get(SettingsService),
    periodSettingsService: app.get(PeriodSettingsService),
    utilsProvider: app.get(UtilsProvider),
  });

  await app.listen(process.env.API_PORT || 3000, async () => {
    require('ts-node/register');
    migrator.up();
  });
}

bootstrap();
