const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Employee extends Model {}

Employee.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    position: { type: DataTypes.STRING, allowNull: false },
    department: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    joinDate: { type: DataTypes.DATEONLY, allowNull: true },
    status: {
      type: DataTypes.ENUM('Active', 'Inactive', 'On Leave'),
      defaultValue: 'Active',
    },
  },
  { sequelize, modelName: 'Employee', tableName: 'employees', timestamps: true }
);

module.exports = Employee;
