require('dotenv').config();
const { Sequelize } = require('sequelize');

const isTest = process.env.NODE_ENV === 'test';

const dbName = isTest
  ? (process.env.TEST_DB_NAME || 'project_tracker_test')
  : (process.env.DB_NAME || 'project_tracker');

const sequelize = new Sequelize(dbName, process.env.DB_USER || 'root', process.env.DB_PASSWORD || '', {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  dialect: 'mysql',
  logging: false,
  define: {
    underscored: true,
  },
});

module.exports = sequelize;
