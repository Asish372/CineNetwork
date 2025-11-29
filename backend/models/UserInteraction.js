const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserInteraction = sequelize.define('UserInteraction', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // Matches table name
      key: 'id',
    },
  },
  contentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Contents', // Matches table name
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM('like', 'watchlist', 'history'),
    allowNull: false,
  },
  progress: {
    type: DataTypes.FLOAT, // Percentage watched (0.0 to 1.0)
    defaultValue: 0,
  },
}, {
  timestamps: true,
});

module.exports = UserInteraction;
