import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as fs from 'fs';


async function bootstrap() {
  dotenv.config(); 
  const port = process.env.PORT || 3000;
  const keyPath=process.env.keyPath // Путь к вашему закрытому ключу
  const certPath=process.env.certPath // Путь к вашему SSL-сертификату

   const httpsOptions = {
    key:await fs.readFileSync(keyPath), 
    cert: await fs.readFileSync(certPath), 
  }; 

  const app = await NestFactory.create(AppModule, { httpsOptions } );

  await app.listen(port);
  console.log(`Application is running on  https://appoint-point.ru/`);
}

bootstrap();