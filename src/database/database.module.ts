import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
//import { MyConfigService } from '../config/config.service'; // Импортируем модуль с ConfigService


@Module({
  
  providers: [DatabaseService],
  exports: [DatabaseService], // Экспортируем DatabaseService для использования в других модулях
})
export class DatabaseModule {}