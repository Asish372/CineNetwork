const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Content = require('./Content');

const WatchHistory = sequelize.define('WatchHistory', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  contentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Content,
      key: 'id',
    },
  },
  progress: {
    type: DataTypes.INTEGER, // Position in milliseconds
    allowNull: false,
    defaultValue: 0,
  },
  lastWatched: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'contentId'],
    },
  ],
});

// Associations
User.hasMany(WatchHistory, { foreignKey: 'userId' });
WatchHistory.belongsTo(User, { foreignKey: 'userId' });

Content.hasMany(WatchHistory, { foreignKey: 'contentId' });
WatchHistory.belongsTo(Content, { foreignKey: 'contentId' });

module.exports = WatchHistory;
