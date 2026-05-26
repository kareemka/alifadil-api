import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  app.enableCors({
    origin: [
      'https://admin.alifadil.com',
      'https://alifadil.com',
      'http://localhost:4001',
      'http://localhost:4002',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  await app.listen(4000);
}
bootstrap();
