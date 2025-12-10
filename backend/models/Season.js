const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Season = sequelize.define('Season', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  contentId: { // Foreign Key to Content (Series)
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  seasonNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
  },
  summary: {
    type: DataTypes.TEXT,
  },
  releaseDate: {
    type: DataTypes.DATEONLY,
  },
  posterUrl: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft',
  }
}, {
  timestamps: true,
});

module.exports = Season;
