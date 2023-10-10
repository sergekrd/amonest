import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
//import * as dotenv from 'dotenv'; // Для загрузки переменных окружения из файла .env

async function bootstrap() {
  // Загрузка переменных окружения из файла .env
  //dotenv.config();

  const app = await NestFactory.create(AppModule);
  const port = 3000; // Получение порта из переменных окружения или использование 3000 по умолчанию

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();