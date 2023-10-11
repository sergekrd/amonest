import { Injectable, HttpException, BadRequestException, HttpStatus } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import axios from 'axios';


@Injectable()
export class AmoService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) { }

  async clientDataToDB(clientData) {
    try {
      const { client_id, client_secret, code, redirect_uri, username } = clientData;
      const newData = await this.databaseService.insertData(
        client_id,
        client_secret,
        code,
        redirect_uri,
        username,
      );
    
    } catch (error) {
      console.error(error)
      throw new HttpException('Ошибка сохранения данных', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async authDataToDB(authData,username) {
    try {
      const { token_type, access_token, refresh_token} = authData;
      let {expires_in}=authData
      expires_in = parseInt(expires_in) + Math.floor(Date.now() / 1000)
      const newData = await this.databaseService.insertAuth(
        token_type,
        expires_in,
        access_token,
        refresh_token,
        username,
      );
    
    } catch (error) {
      console.error(error)
      throw new HttpException('Ошибка сохранения токенов данных', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getClientAuth(data) {
    try {
      const { client_id, client_secret, code, redirect_uri, username } = data;

      const newData = {
        client_id, client_secret, code, redirect_uri, grant_type: 'authorization_code'
      }

      const url = `https://${username}.amocrm.ru/oauth2/access_token`
      const response = await axios.post(`https://${username}.amocrm.ru/oauth2/access_token`, newData);

      if (response.status === 200) {
        return response.data;
      } else {
        console.error(`Ошибка при отправке POST-запроса на ${url}`)
        throw new HttpException('Ошибка при отправке POST-запроса', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      console.error(error)
      throw new HttpException('Ошибка получения токена авторизации', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}