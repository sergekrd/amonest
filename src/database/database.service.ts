import { Injectable } from '@nestjs/common';
import { IDatabase, IMain } from 'pg-promise';
import * as pgPromise from 'pg-promise';

import * as dotenv from 'dotenv';

@Injectable()
export class DatabaseService {
  private readonly db: IDatabase<any>;
  private readonly pgp: IMain;

  constructor() {
    dotenv.config();
    const dbConnectData = {
    'user': process.env.dbUser,
    'password' : process.env.dbPassword,
    'host' : process.env.dbHost,
    'port' : process.env.dbPort,
    'database':  process.env.dbDatabase,
    }
    const DATABASE_URL= process.env.DATABASE_URL
    console.log(dbConnectData)
      

    this.pgp = pgPromise();
    this.db = this.pgp({ connectionString: process.env.DATABASE_URL,});  
  }

  async createTables(): Promise<void> {
    try {
      await this.createDataTable();
      await this.createAuthTable();
      console.log('Таблицы успешно созданы.');
    } catch (error) {
      console.error('Ошибка при создании таблиц:', error.message);
    }
  }

  private async createDataTable(): Promise<void> {
    try {
      await this.db.none(`
        CREATE TABLE IF NOT EXISTS data (
            id SERIAL PRIMARY KEY,
            client_id VARCHAR(255),
            client_secret VARCHAR(255),           
            code TEXT,
            redirect_uri VARCHAR(255),
            username VARCHAR(255) UNIQUE
        );
      `);
      console.log('Таблица data создана или уже существует.');
    } catch (error) {
      console.error('Ошибка при создании таблицы data:', error.message);
      throw error;
    }
  }

  private async createAuthTable(): Promise<void> {
    try {
      await this.db.none(`
        CREATE TABLE IF NOT EXISTS auth (
            id SERIAL PRIMARY KEY,
            token_type VARCHAR(255),
            expires_in INT,
            access_token TEXT,
            refresh_token TEXT,
            username VARCHAR(255) REFERENCES data(username) ON DELETE CASCADE
        );
      `);
      console.log('Таблица auth создана или уже существует.');
    } catch (error) {
      console.error('Ошибка при создании таблицы data:', error.message);
      throw error;
    }
  }

  async insertData(
    client_id: string,
    client_secret: string,  
    code: string,
    redirect_uri: string,
    username: string,
  ): Promise<any> {
    try {
      const newData = await this.db.one(
        `
          INSERT INTO data (client_id, client_secret, code, redirect_uri, username)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *;
        `,
        [client_id, client_secret, code, redirect_uri, username],
      );
      return true;
    } catch (error) {
      console.error('Ошибка при вставке данных:', error.message);
      throw error;
    }
  }

  async updateCode(client_id: string, code: string): Promise<any> {
    try {
      await this.db.none(`
        UPDATE data
        SET code = $1
        WHERE client_id = $2;
      `, [code, client_id]);
      return { success: true, message: 'Код успешно добавлен в таблицу data.' };
    } catch (error) {
      console.error('Ошибка при добавлении кода:', error.message);
      throw error;
    }
  }

  async updateAuth(
    username: string,
    access_token: string,
    refresh_token: string,
    expires_in: number,
  ): Promise<any> {
    try {
      await this.db.none(`
        UPDATE auth
        SET access_token = $2, refresh_token = $3, expires_in = $4
        WHERE username = $1;
      `, [username, access_token, refresh_token, expires_in]);
      return { success: true, message: 'refresh_token успешно обновлен в таблице auth.' };
    } catch (error) {
      console.error('Ошибка при обновлении:', error.message);
      throw error;
    }
  }

  async getDataByClientId(client_id: string): Promise<any> {
    try {
      const result = await this.db.oneOrNone(
        'SELECT * FROM data WHERE client_id = $1',
        client_id,
      );
      if (result) {
        return result;
      } else {
        console.log(`Данные для пользователя ${client_id} не найдены.`);
        return null;
      }
    } catch (error) {
      console.error('Ошибка при получении данных:', error.message);
      throw error;
    }
  }

  async getDataByClientUsername(username: string): Promise<any> {
    try {
      const result = await this.db.oneOrNone(
        'SELECT * FROM data WHERE username = $1',
        username,
      );

      if (result) {
        return result;
      } else {
        console.log(`Данные для пользователя ${username} не найдены.`);
        return null;
      }
    } catch (error) {
      console.error('Ошибка при получении данных:', error.message);
      throw error;
    }
  }

  async getAuth(username: string): Promise<any> {
    try {
      const result = await this.db.oneOrNone(
        'SELECT * FROM auth WHERE username = $1',
        username,
      );

      if (result) {
        return result;
      } else {
        console.log(`Данные для пользователя ${username} не найдены.`);
        return null;
      }
    } catch (error) {
      console.error('Ошибка при получении данных:', error.message);
      throw error;
    }
  }

  async insertAuth(
    token_type: string,
    expires_in: number,
    access_token: string,
    refresh_token: string,
    username: string,
  ): Promise<any> {
    try {
      const newData = await this.db.one(
        `
          INSERT INTO auth (token_type, expires_in, access_token, refresh_token, username)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *;
        `,
        [token_type, expires_in, access_token, refresh_token, username],
      );
      return newData;
    } catch (error) {
      console.error('Ошибка при вставке данных:', error.message);
      throw error;
    }
  }
}