import { Controller, Post, Get, Body, HttpException, HttpStatus, HttpCode, Req } from '@nestjs/common';
import { AmoService } from './amo.service';
import { AuthService } from '../utils/auth.service';
import { validateName, validateLastName, validateEmail, validatePhoneNumber } from '../utils/validation.service';


@Controller('api/amocrm')
export class AmoController {
  constructor(
    private readonly amoService: AmoService,
    private readonly authService: AuthService,
  ) { }

  /* Стартовый запрос, передаем данные полученные при создании интеграции */
  @Post('/setclientdata')
  @HttpCode(HttpStatus.OK) // Указываем статус ответа
  async setClientData(@Body() requestBody) {
    try {
      const { client_id, client_secret, code, redirect_uri, username } = requestBody;

      // Проверяем наличие обязательных полей
      if (!client_id || !client_secret || !code || !redirect_uri || !username) {
        throw new HttpException('Отсутствуют обязательные поля', HttpStatus.BAD_REQUEST);
      }

      const authData = await this.amoService.getClientAuth(requestBody)
      await this.amoService.clientDataToDB(requestBody);
      await this.amoService.authDataToDB(authData, username);

      return { message: 'Данные успешно добавлены' }
    } catch (error) {
      console.error('Ошибка:', error.message);
      throw new HttpException('Ошибка сохранения данных', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /*  */
  @Get('/createdeal')
  @HttpCode(HttpStatus.OK) // Указываем статус ответа
  async setAuthKey(@Req() req) {
    try {

      const queryParameters = req.query;
      const { name, email, phone, amo_username } = queryParameters

      if (!name || !email || !phone || !amo_username) {
        throw new HttpException('Переданы не все данные, необходимы: name, email, phone, amo_username', HttpStatus.BAD_REQUEST);
      }

      const [lastName, firstName] = name.split(' ')

      /* Проверка полученных данных контакта */
      validateName(lastName)
      validateLastName(firstName)
      validateEmail(email)
      const phoneNumber = validatePhoneNumber(phone)

      /* Получение актуального токена */
      const token = await this.authService.checkAuthTokenValidity(amo_username);

      /* поиск контакта в Амо */
      let user = await this.amoService.getContactFromAmo(phoneNumber, email, amo_username, token)
      let message = []
      if (user) {
        /* контакта есть, набор текста ответа на запрос*/
        message.push(`Контакт с телефоном ${phoneNumber} и почтой ${email} есть в AmoCRM`)

        if (user.first_name != firstName || user.last_name != lastName) {
          /* если введенные фамилия или имя отличаются от найденных в Амо, добавлем текст овета на запрос и обновляем контакт в Амо */
          if (user.first_name != firstName)
            message.push(`Имя не соответсвует, изменено с  ${user.first_name} на указанное в запросе ${firstName}`)

          if (user.last_name != lastName) {
            message.push(`\r Фамилия не соответсвует, изменена с  ${user.last_name} на указанную в запросе ${lastName}`)
          }
          await this.amoService.updateContactToAmo(user.id, firstName, lastName, amo_username, token)
        }
      }
      else {
        /* контакта нет, добавляем в Амо, набор текста ответа на запрос */
        user = await this.amoService.addContactToAmo(phoneNumber, email, firstName, lastName, amo_username, token)
        message.push(`Контакт ${firstName} ${lastName} с телефоном ${phoneNumber} и почтой ${email} добавлен в AmoCRM`)
      }
      /* Получаем массив статусов воронки, нулевой статус "Неразобранное" не проходит проверку при добавлении сдели */
      const pipelineStatuses = await this.amoService.getPipelineStatuses(amo_username, token)
      const pipelineId = pipelineStatuses[1].pipeline_id
      const statusId = pipelineStatuses[1].id

      /* Получаем массив статусов воронки, нулевой статус "Неразобранное" не проходит проверку при добавлении сдели */
      const dealName = `Сделка ${firstName} ${lastName}`
      const price = 1000

      /* Создаем сделку с присваиванием статуса воронки и привязкой к контакту */
      const dealId = await this.amoService.addDealToAmo(user.id, dealName, price, pipelineId, statusId, amo_username, token)

      message.push(`Сделка "${dealName}" на ${price} создана и привязана к контакту ${firstName} ${lastName}`)

      return { message: message }

    } catch (error) {
      console.error('Ошибка:', error.message);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  /*  */
  @Get('/authtoken')
  @HttpCode(HttpStatus.OK) // Указываем статус ответа
  async authtoken(@Req() req) {
    try {
      const {amo_username } = req.query;
      /* Получение актуального токена */
      const token = await this.authService.checkAuthTokenValidity(amo_username);  
      return { message: {token} }

    } catch (error) {
      console.error('Ошибка:', error.message);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}



