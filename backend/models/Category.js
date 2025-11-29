const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // e.g., "Trending Now", "Action Movies"
  },
  type: {
    type: DataTypes.ENUM('movie', 'short', 'mixed'),
    defaultValue: 'mixed',
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
});

module.exports = Category;
