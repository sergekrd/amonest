import { Injectable, HttpException,BadRequestException, HttpStatus } from '@nestjs/common';
import { DatabaseService } from '../database/database.service'; // Импортируйте ваш DatabaseService


@Injectable()
export class ContactsService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async setSecretData(data) {
    try {
      const { client_id, client_secret, grant_type, code, redirect_uri, username } = data;

      // Проверяем наличие обязательных полей
      if (!client_id || !client_secret || !grant_type || !redirect_uri || !username) {
        throw new BadRequestException('Отсутствуют обязательные поля');
      }

      // Добавляем запись в таблицу data, оставляя поле code пустым
      const newData = await this.databaseService.insertData(
        client_id, // Ваши данные для вставки
        client_secret, 
        code,
        redirect_uri,
        username,
      );

         return newData;
    } catch (error) {
      throw new Error('Ошибка сохранения данных');
    }
  }
  
}