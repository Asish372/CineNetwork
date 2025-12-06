const sequelize = require('../config/db');
const User = require('./User');
const Otp = require('./Otp');
const Content = require('./Content');
const Category = require('./Category');
const UserInteraction = require('./UserInteraction');
const WatchHistory = require('./WatchHistory');

// Define Associations
User.hasMany(UserInteraction, { foreignKey: 'userId' });
UserInteraction.belongsTo(User, { foreignKey: 'userId' });

Content.hasMany(UserInteraction, { foreignKey: 'contentId' });
UserInteraction.belongsTo(Content, { foreignKey: 'contentId' });

// Many-to-Many: Content <-> Category
// We need a junction table for this
const ContentCategory = sequelize.define('ContentCategory', {}, { timestamps: false });
Content.belongsToMany(Category, { through: ContentCategory });
Category.belongsToMany(Content, { through: ContentCategory });

module.exports = {
  sequelize,
  User,
  Otp,
  Content,
  Category,
  UserInteraction,
  ContentCategory,
  WatchHistory
};
