const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false, // e.g., "Silver", "Gold", "Diamond"
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  durationInDays: {
    type: DataTypes.INTEGER,
    allowNull: false, // 30, 365, etc.
  },
  features: {
    type: DataTypes.JSON, // Array of strings e.g. ["Ad-free", "4K", "3 Screens"]
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

module.exports = SubscriptionPlan;
