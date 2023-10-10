import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AmoModule } from './amo/amo.module'; // Импортируйте ваш AmoModule

@Module({
  imports: [AmoModule], // Добавьте AmoModule в раздел imports
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}