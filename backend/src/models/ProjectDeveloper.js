const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class ProjectDeveloper extends Model {}

ProjectDeveloper.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    projectId: { type: DataTypes.INTEGER, allowNull: false },
    employeeId: { type: DataTypes.INTEGER, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: true },
    assignedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: 'ProjectDeveloper', tableName: 'project_developers', timestamps: true }
);

module.exports = ProjectDeveloper;
