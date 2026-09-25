const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

const PROJECT_STATUSES = ['Planning', 'In Progress', 'Blocked', 'Completed'];

class Project extends Model {}

Project.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    description: { type: DataTypes.TEXT, allowNull: true },
    deadline: { type: DataTypes.DATEONLY, allowNull: true },
    status: {
      type: DataTypes.ENUM(...PROJECT_STATUSES),
      allowNull: false,
      defaultValue: 'Planning',
    },
    version: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  },
  { sequelize, modelName: 'Project', tableName: 'projects', timestamps: true }
);

Project.STATUSES = PROJECT_STATUSES;

module.exports = Project;
