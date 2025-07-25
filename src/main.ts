import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:5173', 'http://13.48.71.179'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });
  
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
