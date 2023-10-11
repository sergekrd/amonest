import { Injectable, HttpException, BadRequestException, HttpStatus } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import axios from 'axios';


@Injectable()
export class AmoService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) { }

  async setClientData(data) {
    try {
      const { client_id, client_secret, code, redirect_uri, username } = data;

      const newData = await this.databaseService.insertData(
        client_id,
        client_secret,   
        code,
        redirect_uri,
        username,
      );

      // Отправляем POST-запрос на нужный вам эндпоинт с данными newData
      const response = await axios.post('https://example.com/your-endpoint', newData);

      // Проверяем статус ответа
      if (response.status === 200) {
        // Возвращаете результат
        return response.data;
      } else {
        throw new HttpException('Ошибка при отправке POST-запроса', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      throw new HttpException('Ошибка сохранения данных', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getClientAuth(data) {
    try {
      const { client_id, client_secret, code, redirect_uri, username } = data;

 const newData={
  client_id,client_secret,code,redirect_uri,grant_type:'authorization_code'
 }
 console.log(newData)

      // Отправляем POST-запрос на нужный вам эндпоинт с данными newData
      const response = await axios.post(`https://${username}.amocrm.ru/oauth2/access_token`, newData);
console.log(response)
      // Проверяем статус ответа
      if (response.status === 200) {
        // Возвращаете результат
        return response.data;
      } else {
        throw new HttpException('Ошибка при отправке POST-запроса', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      console.error(error)
      throw new HttpException('Ошибка получения токена авторизации', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}