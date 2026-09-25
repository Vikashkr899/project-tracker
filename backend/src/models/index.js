const sequelize = require('../config/database');
const User = require('./User');
const Project = require('./Project');
const Task = require('./Task');
const ActivityLog = require('./ActivityLog');

// Associations
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks', onDelete: 'CASCADE' });
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

User.hasMany(Task, { foreignKey: 'assigneeId', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });

Project.hasMany(ActivityLog, { foreignKey: 'projectId', as: 'activityLogs', onDelete: 'CASCADE' });
Task.hasMany(ActivityLog, { foreignKey: 'taskId', as: 'activityLogs', onDelete: 'CASCADE' });
ActivityLog.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
ActivityLog.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

module.exports = { sequelize, User, Project, Task, ActivityLog };
