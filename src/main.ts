import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  dotenv.config();

  const port = process.env.PORT!;
  const host = process.env.HOST!;

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:4200', // Ganti dengan domain produksi nanti
    credentials: true,
  });
  app.use(cookieParser());

  // *** Start Config Swagger ***

  const swaggerConfig = new DocumentBuilder()
    .setTitle('PPA')
    .setDescription('SS6')
    .setVersion('1.0')
    .addTag('Access Control')
    .addServer(`http://${host}:${port}`)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that are not in the DTO
      forbidNonWhitelisted: true, // Throw an error if a non-whitelisted property is included
      transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
    }),
  );

  await app.listen(port, host, () => {
    console.log('[WEB SERVICE]', `${host}:${port}`);
  });
}
bootstrap();
