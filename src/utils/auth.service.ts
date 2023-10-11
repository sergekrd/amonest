import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import axios from 'axios';

@Injectable()
export class AuthService {
    db = new DatabaseService

    /* Проверка токена на наличие и срок жизни, обновление по истечении, возвращаем актуальный токен */
    async checkAuthTokenValidity(username: string) {
        try {
            const currentTimestamp = Math.floor(Date.now() / 1000);
            const authData = await this.db.getAuthByUsername(username)
            if (!authData) {
                 console.error(`Нет данных авторизации для ${username}`);
                throw new HttpException(`Нет данных авторизации для ${username}`, HttpStatus.INTERNAL_SERVER_ERROR);               
            }
            if (authData.expires_in && authData.expires_in < currentTimestamp) {
                const data = await this.db.getDataByClientUsername(username)
                const newAccessToken = await this.refreshToken(authData.refresh_token, data, username);
                return newAccessToken;
            }
            else {
                return authData.access_token;
            }
        } catch (error) {
            console.error('Ошибка обновления токена:', error.message);
            throw new HttpException('Ошибка обновления токена', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /* Обновление токена */
   private async refreshToken(refreshToken: string, data: any, username: string) {
        try {
            const body = {
                client_id: data.client_id,
                client_secret: data.client_secret,
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                redirect_uri: data.redirect_uri
            }

            const url = `https://${username}.amocrm.ru/oauth2/access_token`
            const response = await axios.post(`https://${username}.amocrm.ru/oauth2/access_token`, body);

            if (response.status === 200) {
                const expires_in = parseInt(response.data.expires_in) + Math.floor(Date.now() / 1000)
                await this.db.updateAuth(username, response.data.access_token, response.data.refresh_token, expires_in)
                return response.data.access_token;
            } else {
                console.error(`Ошибка при отправке POST-запроса на ${url}`)
                throw new HttpException('Ошибка при отправке POST-запроса', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        catch (error) {
            console.log('Ошибка в refreshToken',error.message)
            throw new HttpException('Ошибка в refreshToken', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
