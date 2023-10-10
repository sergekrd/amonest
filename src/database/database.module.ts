import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
//import { MyConfigService } from '../config/config.service'; // Импортируем модуль с ConfigService
import { MyConfigModule } from '../config/config.module';

@Module({
  imports: [MyConfigModule], // Импортируем модуль с ConfigService
  providers: [DatabaseService/* ,MyConfigService */],
  exports: [DatabaseService], // Экспортируем DatabaseService для использования в других модулях
})
export class DatabaseModule {}