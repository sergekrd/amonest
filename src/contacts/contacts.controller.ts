import { Controller, Post, Body, HttpException, HttpStatus, HttpCode } from '@nestjs/common';
import { ContactsService } from './contacts.service';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

   @Post('/contacts')
   @HttpCode(HttpStatus.OK) // Указываем статус ответа
  async setSecretData(@Body() requestBody) {
    try {
      const { client_id, client_secret, grant_type, code, redirect_uri, username } = requestBody;

      // Проверяем наличие обязательных полей
      if (!client_id || !client_secret || !grant_type || !redirect_uri || !username) {
        throw new HttpException('Отсутствуют обязательные поля', HttpStatus.BAD_REQUEST);
      }

     
      const newData = await this.contactsService.setSecretData(requestBody);

      return { message: 'Данные успешно добавлены' }
    } catch (error) {
      console.error('Ошибка:', error.message);
      throw new HttpException('Ошибка сохранения данных', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

