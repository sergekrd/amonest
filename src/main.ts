import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as https from 'https';
//import { MyConfigService } from './config/config.service';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
//import * as dotenv from 'dotenv'; // Для загрузки переменных окружения из файла .env

async function bootstrap() {
  dotenv.config(); 
  const port = process.env.PORT || 3000;
  const keyPath=process.env.keyPath
  const certPath=process.env.certPath
 // let configService: MyConfigService
  const httpsOptions = {
    key:await fs.readFileSync(keyPath), // Путь к вашему закрытому ключу
    cert: await fs.readFileSync(certPath), // Путь к вашему SSL-сертификату
  };
 console.log(JSON.stringify(httpsOptions))
  // Загрузка переменных окружения из файла .env
  //dotenv.config();
  const app = await NestFactory.create(AppModule);

  const httpsServer = https.createServer(httpsOptions, app.getHttpAdapter().getInstance());

  

  await app.listen(port);
  console.log(`Application is running on ${port}: https://your-domain.com`);
}

bootstrap();