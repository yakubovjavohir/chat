import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
// main.ts
  const app = await NestFactory.create(AppModule, { cors: false }); 
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
