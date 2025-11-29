const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Otp = sequelize.define('Otp', {
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  // Store user data temporarily for signup verification
  tempUserData: {
    type: DataTypes.JSON,
    allowNull: true,
  }
}, {
  timestamps: true,
});

module.exports = Otp;
