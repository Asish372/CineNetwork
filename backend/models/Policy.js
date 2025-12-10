const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Policy = sequelize.define('Policy', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('free', 'subscription', 'transactional'),
    defaultValue: 'subscription'
  },
  price: {
    type: DataTypes.FLOAT, // 0 if free/sub
    defaultValue: 0
  },
  rentalWindowDays: {
    type: DataTypes.INTEGER, // e.g. 2 days (48h)
    defaultValue: 0
  },
  drmEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  licenseServerUrl: {
    type: DataTypes.STRING,
  },
  allowedCountries: {
    type: DataTypes.JSON, // ['US', 'IN'] or null for all
  },
  maxDevices: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  offlineAllowed: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
});

module.exports = Policy;
