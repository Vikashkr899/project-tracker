const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

const TASK_STATUSES = ['To Do', 'In Progress', 'Blocked', 'Done'];
const TASK_PRIORITIES = ['Low', 'Medium', 'High'];

class Task extends Model {}

Task.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    projectId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    description: { type: DataTypes.TEXT, allowNull: true },
    assigneeId: { type: DataTypes.INTEGER, allowNull: true },
    deadline: { type: DataTypes.DATEONLY, allowNull: true },
    priority: {
      type: DataTypes.ENUM(...TASK_PRIORITIES),
      allowNull: false,
      defaultValue: 'Medium',
    },
    status: {
      type: DataTypes.ENUM(...TASK_STATUSES),
      allowNull: false,
      defaultValue: 'To Do',
    },
    blockerReason: { type: DataTypes.TEXT, allowNull: true },
    blockerReportedBy: { type: DataTypes.STRING, allowNull: true },
    blockerReportedAt: { type: DataTypes.DATE, allowNull: true },
    // Optimistic concurrency: bumped on every update; clients must send the
    // version they last read. A mismatch means someone else edited the task
    // first, and we reject the write instead of silently overwriting it.
    version: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  },
  {
    sequelize,
    modelName: 'Task',
    tableName: 'tasks',
    timestamps: true,
    validate: {
      blockerFieldsRequiredWhenBlocked() {
        if (this.status === 'Blocked') {
          if (!this.blockerReason || !this.blockerReportedBy) {
            throw new Error('blockerReason and blockerReportedBy are required when status is Blocked');
          }
        }
      },
    },
  }
);

Task.STATUSES = TASK_STATUSES;
Task.PRIORITIES = TASK_PRIORITIES;

module.exports = Task;
