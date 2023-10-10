import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MyConfigService {
  constructor(private configService: ConfigService) {}
  
  getdbConnectData(): JSON {
    return this.configService.get<JSON>('dbConnectData');
  }

  gethttpsOptions(): JSON {
    return this.configService.get<JSON>('httpsOptions');
  }
}
