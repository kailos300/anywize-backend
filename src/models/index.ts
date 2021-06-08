import fs from 'fs';
import path from 'path';
import getenv from 'getenv';
import debug from 'debug';
const Sequelize = require('sequelize');

const basename = path.basename(module.filename);
const Debug = debug('anywize:sequelize');
const models: any = {};


const dbConfig = {
  username: getenv('ANYWIZE_MYSQL_USERNAME'),
  password: getenv('ANYWIZE_MYSQL_PASSWORD'),
  database: getenv('ANYWIZE_MYSQL_DATABASE'),
  host: getenv('ANYWIZE_MYSQL_HOST'),
  dialect: 'mysql',
  logging: false,
};
Debug('Starting sequelize');

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);
const ext = ['test'].includes(process.env.NODE_ENV) ? '.ts' : '.js';

fs
  .readdirSync(__dirname)
  .filter((file) => (file.indexOf('.') !== 0) && !file.includes('index') && !file.includes('.map') && (file.slice(-3) === ext))
  .forEach((file) => {
    const model = require(path.join(__dirname, file)).default(sequelize, Sequelize.DataTypes);
    models[model.name] = model;
  });

Object.values(models).forEach((model: any) => {
  Debug(`Associating ${model.name}...`);

  if (model.associate) {
    model.associate(models);
  }
});

// sequelize.sync();
models.sequelize = sequelize;

export default models;
