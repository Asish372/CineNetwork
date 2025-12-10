const sequelize = require('../config/db');
const User = require('./User');
const Otp = require('./Otp');
const Content = require('./Content');
const Season = require('./Season');
const Episode = require('./Episode');
const Category = require('./Category');
const UserInteraction = require('./UserInteraction');
const WatchHistory = require('./WatchHistory');

const Layout = require('./Layout');
const SubscriptionPlan = require('./SubscriptionPlan');
const UserSubscription = require('./UserSubscription');

// Associations
User.hasMany(UserInteraction, { foreignKey: 'userId' });
UserInteraction.belongsTo(User, { foreignKey: 'userId' });

Content.hasMany(UserInteraction, { foreignKey: 'contentId' });
UserInteraction.belongsTo(Content, { foreignKey: 'contentId' });

// Many-to-Many: Content <-> Category
const ContentCategory = sequelize.define('ContentCategory', {}, { timestamps: false });
Content.belongsToMany(Category, { through: ContentCategory });
Category.belongsToMany(Content, { through: ContentCategory });

// Series Associations
Content.hasMany(Season, { foreignKey: 'contentId', as: 'seasons', onDelete: 'CASCADE' });
Season.belongsTo(Content, { foreignKey: 'contentId' });

Season.hasMany(Episode, { foreignKey: 'seasonId', as: 'episodes', onDelete: 'CASCADE' });
Episode.belongsTo(Season, { foreignKey: 'seasonId' });

User.belongsToMany(Content, { through: WatchHistory });
Content.belongsToMany(User, { through: WatchHistory });

WatchHistory.belongsTo(Content, { foreignKey: 'contentId' });
WatchHistory.belongsTo(User, { foreignKey: 'userId' });

// Subscription Associations
User.hasOne(UserSubscription, { foreignKey: 'userId' });
UserSubscription.belongsTo(User, { foreignKey: 'userId' });

SubscriptionPlan.hasMany(UserSubscription, { foreignKey: 'planId' });
UserSubscription.belongsTo(SubscriptionPlan, { foreignKey: 'planId' });

module.exports = {
  sequelize,
  User,
  Otp,
  Content,
  Season,
  Episode,
  Category,
  UserInteraction,
  ContentCategory,
  WatchHistory,
  Layout,
  SubscriptionPlan,
  UserSubscription
};
