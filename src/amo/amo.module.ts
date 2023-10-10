import { Module } from '@nestjs/common';
import { AmoController } from './amo.controller';
import { AmoService } from './amo.service';
import { DatabaseModule } from '../database/database.module'; // Импортируем модуль с DatabaseService

@Module({
  imports: [DatabaseModule], // Импортируем модуль с DatabaseService
  controllers: [AmoController],
  providers: [AmoService],
})
export class AmoModule {}
