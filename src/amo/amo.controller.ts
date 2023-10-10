import { Controller, Post, Body, HttpException, HttpStatus, HttpCode } from '@nestjs/common';
import { AmoService } from './amo.service';

@Controller('api/amocrm')
export class AmoController {
  constructor(private readonly amoService: AmoService) {}

   @Post('/setsecretdata')
   @HttpCode(HttpStatus.OK) // Указываем статус ответа
  async setSecretData(@Body() requestBody) {
    try {
      const { client_id, client_secret, grant_type, code, redirect_uri, username } = requestBody;

      // Проверяем наличие обязательных полей
      if (!client_id || !client_secret || !grant_type || !code|| !redirect_uri || !username) {
        throw new HttpException('Отсутствуют обязательные поля', HttpStatus.BAD_REQUEST);
      }     
      const newData = await this.amoService.setSecretData(requestBody);
      return { message: 'Данные успешно добавлены' }
    } catch (error) {
      console.error('Ошибка:', error.message);
      throw new HttpException('Ошибка сохранения данных', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

