import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './prisma/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: ['http://localhost:5173', 'http://localhost:4173'] });
  app.useGlobalFilters(new PrismaExceptionFilter());
  // Note: no `whitelist` — existing DTOs document fields with @ApiProperty only
  // (no class-validator decorators), and whitelist would strip them. Validation
  // still runs on DTOs that DO carry class-validator decorators (e.g. policy bounds).
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
    .setTitle('SettleIT API')
    .setDescription(
      'Payment reminder flow management for medical practitioners.\n\n' +
        '**Flow** — register a `PatientExamination` to trigger the active reminder flow, ' +
        'which produces `PaymentRequest` records automatically.',
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
