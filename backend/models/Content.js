const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Content = sequelize.define('Content', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('movie', 'short', 'series'),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  thumbnailUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  duration: {
    type: DataTypes.STRING, // e.g., "2h 15m" or "15s"
    allowNull: true,
  },
  genre: {
    type: DataTypes.STRING, // Comma separated or JSON
    allowNull: true,
  },
  isVip: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
});

module.exports = Content;
