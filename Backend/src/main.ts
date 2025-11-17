import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend integration
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', '*'],
    methods: 'GET,POST,PUT,PATCH,DELETE',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove any extra fields not in DTO
      forbidNonWhitelisted: true, // Throw error instead of removing
      transform: true, // Convert string inputs to expected type
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
}

bootstrap().catch((error) => {
  throw error;
});
