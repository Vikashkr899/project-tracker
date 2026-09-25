const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class ActivityLog extends Model {}

ActivityLog.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    projectId: { type: DataTypes.INTEGER, allowNull: false },
    taskId: { type: DataTypes.INTEGER, allowNull: true },
    actor: { type: DataTypes.STRING, allowNull: false },
    action: { type: DataTypes.STRING, allowNull: false }, // e.g. "status_change", "task_created", "blocker_reported"
    previousStatus: { type: DataTypes.STRING, allowNull: true },
    newStatus: { type: DataTypes.STRING, allowNull: true },
    details: { type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, modelName: 'ActivityLog', tableName: 'activity_logs', timestamps: true, updatedAt: false }
);

module.exports = ActivityLog;
