import { Controller, Post, Get, Body, HttpException, HttpStatus, HttpCode } from '@nestjs/common';
import { AmoService } from './amo.service';

@Controller('api/amocrm')
export class AmoController {
  constructor(private readonly amoService: AmoService) { }

  @Post('/setclientdata')
  @HttpCode(HttpStatus.OK) // Указываем статус ответа
  async setClientData(@Body() requestBody) {
    try {
      const { client_id, client_secret, code, redirect_uri, username } = requestBody;

      // Проверяем наличие обязательных полей
      if (!client_id || !client_secret || !code || !redirect_uri || !username) {
        throw new HttpException('Отсутствуют обязательные поля', HttpStatus.BAD_REQUEST);
      }
      console.log(requestBody)
      const authData = await this.amoService.getClientAuth(requestBody)
      console.log(authData)

     await this.amoService.clientDataToDB(requestBody);
     await this.amoService.authDataToDB (authData,username);

      return { message: 'Данные успешно добавлены' }
    } catch (error) {
      console.error('Ошибка:', error.message);
      throw new HttpException('Ошибка сохранения данных', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @Get('/setauthkey')
  @HttpCode(HttpStatus.OK) // Указываем статус ответа
  async setAuthKey(@Body() requestBody) {
    try {
      console.log(requestBody)
      const { client_id, client_secret, grant_type, code, redirect_uri, username } = requestBody;

      // Проверяем наличие обязательных полей
      if (!client_id || !client_secret || !grant_type || !code || !redirect_uri || !username) {
        throw new HttpException('Отсутствуют обязательные поля', HttpStatus.BAD_REQUEST);
      }
      const newData = await this.amoService.clientDataToDB(requestBody);
      return { message: 'Данные успешно добавлены' }
    } catch (error) {
      console.error('Ошибка:', error.message);
      throw new HttpException('Ошибка сохранения данных', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}



