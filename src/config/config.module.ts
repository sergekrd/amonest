import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MyConfigService } from './config.service';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [MyConfigService],
  exports: [MyConfigService],
})
export class MyConfigModule {}