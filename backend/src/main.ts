import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';




async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:5173', // Allow requests from Vite dev server
    credentials: true,
  });
  // Enable transformation so DTO @Transform decorators apply
  // Also whitelist to strip unknown fields from payloads
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
