import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import axios from 'axios';


@Injectable()
export class AmoService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) { }

  /* Сохранение данных, передаваемых в /setclientdata в БД */
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
      console.error('Ошибка сохранения данных', error)
      throw new HttpException('Ошибка сохранения данных', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

   /* Сохранение данных авторизации в БД*/
  async authDataToDB(authData, username) {
    try {
      const { token_type, access_token, refresh_token } = authData;
      let { expires_in } = authData
      expires_in = parseInt(expires_in) + Math.floor(Date.now() / 1000)
      const newData = await this.databaseService.insertAuth(
        token_type,
        expires_in,
        access_token,
        refresh_token,
        username,
      );

    } catch (error) {
      console.error('Ошибка сохранения токенов данных', error)
      throw new HttpException('Ошибка сохранения токенов данных', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /* Получение access_token при запросе /setclientdata */
  async getClientAuth(data) {
    try {
      const { client_id, client_secret, code, redirect_uri, username } = data;

      const newData = { client_id, client_secret, code, redirect_uri, grant_type: 'authorization_code' }
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

  /* Поиск контакта по номеру телефона и почте.  */
  async getContactFromAmo(phoneNumber: string, email: string, subdomain: string, access_token: string) {
    try {
      const url = `https://${subdomain}.amocrm.ru/api/v4/contacts?query=${phoneNumber}&query=${email}`
      const headers = {
        'Authorization': `Bearer ${access_token}`      };
      const response = await axios.get(url, { headers });
      if (response.status === 200) {
        return response.data._embedded.contacts[0];
      } else if (response.status === 204) {
        return false
      }
      else {
        console.error(`Ошибка при отправке POST-запроса на ${url}`)
        throw new HttpException('Ошибка при отправке POST-запроса', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      console.error(`Ошибка при поиске контакта phoneNumber ${phoneNumber} email ${email}`, error.message)
      throw new HttpException('Ошибка при поиске контакта', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /* Добавление контакта в Amo c привязкой к пользователю */
  async addContactToAmo(phoneNumber: string, email: string, firstName: string, lastName: string, subdomain: string, access_token: string) {
    try {
      const url = `https://${subdomain}.amocrm.ru/api/v4/contacts`
      const headers = {
        'Authorization': `Bearer ${access_token}`
      };
      const user = await getCurrenUserIdFromAmo(subdomain, access_token)
      const body =
        [
          {
            "name": `${firstName} ${lastName}`,
            "created_by": user.current_user_id,
            "first_name": firstName,
            "last_name": lastName,
            "custom_fields_values": [
              {
                "field_id": 228433,
                "values": [{"value": phoneNumber,"enum_id": 123795}]
              },
              {
                "field_id": 228435,
                "values": [{"value": email,"enum_id": 123807}]
              }
            ],
          }
        ]

      const response = await axios.post(url, body, { headers });
      if (response.status === 200) {
        return response.data._embedded.contacts[0];
      } else if (response.status === 204) {
        return null
      }
      else {
        console.error(`Ошибка при отправке POST-запроса на ${url}`)
        throw new HttpException('Ошибка при отправке POST-запроса', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      console.error(`Ошибка добавления контакта firstName ${firstName} lastName ${lastName}`, error.message)
      throw new HttpException('Ошибка добавления контакта', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /* Обновление фамилии и имени контакта по его id */
  async updateContactToAmo(id: number, firstName: string, lastName: string, subdomain: string, access_token: string) {
    try {
      const url = `https://${subdomain}.amocrm.ru/api/v4/contacts/${id}`
      const headers = {
        'Authorization': `Bearer ${access_token}`
      };
      const body =
      {
        "id": id,
        "name": `${firstName} ${lastName}`,
        "first_name": firstName,
        "last_name": lastName
      }
      const response = await axios.patch(url, body, { headers });
      if (response.status === 200) {
        return response.data;
      }
      else {
        console.error(`Ошибка при отправке PATCH-запроса на ${url}`)
        throw new HttpException('Ошибка при отправке PATCH-запроса', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      console.error(`Ошибка изменения контакта id ${id} firstName ${firstName} lastName ${lastName}`, error.message)
      throw new HttpException('Ошибка изменения контакта', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

/* Добавляем сделку с привязкой к контакту, указанием id воронки и первого статуса воронки (формально первый статус "Неразобранное", но Amo выдает ошибку на id этого статуса) */
  async addDealToAmo(contactId: number, name: string, price: number, pipelineId: number, statusId: number, subdomain: string, access_token: string) {
    try {
      const url = `https://${subdomain}.amocrm.ru/api/v4/leads`
      const headers = {
        'Authorization': `Bearer ${access_token}`
      };
      const user = await getCurrenUserIdFromAmo(subdomain, access_token)
      const body = [{
        "name": name,
        "price": price,
        "created_by": user.current_user_id,
        "account_id": contactId,
        "pipeline_id": pipelineId,
        "status_id": statusId,
        "_embedded": { "contacts": [{ "id": contactId }] }
      }]
      const response = await axios.post(url, body, { headers });
      if (response.status === 200) {
        return response.data._embedded.leads[0].id;
      }
      else {
        console.error(`Ошибка при отправке POST-запроса на ${url}`)
        throw new HttpException('Ошибка при отправке POST-запроса', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      console.error(`Ошибка добавления сделки ${name} contact_id ${contactId}`, error.message)
      throw new HttpException('Ошибка добавления сделки', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

/* TO DO можно удалить, вначале создавал сделку, потом привязывал её через link к контакту */
/* Привязка сделки к контакту */
  async addLinkToDeal(dealId: number, contactId: number, subdomain: string, access_token: string) {
    try {
      const url = `https://${subdomain}.amocrm.ru/api/v4/leads/${dealId}/link`
      const headers = {
        'Authorization': `Bearer ${access_token}`
      };
      const body = [{
        to_entity_id: contactId,
        to_entity_type: "contacts"
      }]
      const response = await axios.post(url, body, { headers });
      if (response.status === 200) {
        return true;
      }
      else {
        console.error(`Ошибка при отправке POST-запроса на ${url}`)
        throw new HttpException('Ошибка при отправке POST-запроса', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      console.error(`Ошибка привязки сделки ${dealId} к contact_id ${contactId}`, error.message)
      throw new HttpException('Ошибка привязки сделки', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /* Получение воронок (она одна, возвращаем её массив её статусов) */
  async getPipelineStatuses(subdomain: string, access_token: string) {
    try {
      const url = `https://${subdomain}.amocrm.ru/api/v4/leads/pipelines`
      const headers = {
        'Authorization': `Bearer ${access_token}`
      };
      const response = await axios.get(url, { headers });

      if (response.status === 200) {
        return response.data._embedded.pipelines[0]._embedded.statuses;
      } else if (response.status === 204) {
        return false
      }
      else {
        console.error(`Ошибка при отправке POST-запроса на ${url}`)
        throw new HttpException('Ошибка при отправке POST-запроса', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      console.error(`Ошибка при получении статусов воронки`, error.message)
      throw new HttpException('Ошибка при получении статусов воронки', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

/* Получение id текущего пользователя, нужен для привязки контактов в пользователю */
async function getCurrenUserIdFromAmo(subdomain: string, access_token: string) {
  try {
    const url = `https://${subdomain}.amocrm.ru/api/v4/account`
    const headers = {
      'Authorization': `Bearer ${access_token}`
    };
    const response = await axios.get(url, { headers });
    if (response.status === 200) {
      return response.data;
    }
    else {
      console.error(`Ошибка при отправке GET-запроса на ${url}`)
      throw new HttpException('Ошибка при отправке GET-запроса', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  catch (error) {
    console.error(`Ошибка в getCurrenUserIdFromAmo, user: ${subdomain}`, error)
    throw new Error("Ошибка получения ID текущего пользователя")
  }

}

