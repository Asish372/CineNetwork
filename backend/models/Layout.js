const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Layout = sequelize.define('Layout', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  page: {
    type: DataTypes.ENUM('home', 'shorts'),
    allowNull: false,
    unique: true // One layout config per page
  },
  heroContent: {
    type: DataTypes.JSON, // Array of Content IDs [1, 5, 12]
    defaultValue: [] 
  },
  sections: {
    type: DataTypes.JSON, 
    // Array of objects: 
    // [{ id: 'sec_1', type: 'trending', title: 'Trending Now', contentIds: [], order: 0 }]
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

module.exports = Layout;
