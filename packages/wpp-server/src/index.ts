import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './config/modules/app.module.js';

async function bootstrap() {
  await NestFactory.createApplicationContext(AppModule);
}

bootstrap();
