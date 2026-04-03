//typeorm-config.ts

//main usecase
//expecially for typeorm migration CLI where we cannnot use NestJS DI to load config service
//we have the similar data in app.module.ts where we have stored the database related configs
//but there we can use DI to load config service
//we cannot ues that file in typeorm migration CLI

//code
import config from 'config/config';
import * as dotenv from 'dotenv';
dotenv.config();
import {DataSource} from 'typeorm';

const AppDataSource = new DataSource({
    type: 'postgres',
    host: config().database.host,
    port: config().database.port,
    username: config().database.username,
    password: config().database.password,
    database: config().database.databaseName,
    entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
    migrations:[__dirname + '/src/migrations/*{.ts,.js}'],
    synchronize: false,
    logging: true,
});

export default AppDataSource;