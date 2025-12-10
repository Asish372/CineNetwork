const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Episode = sequelize.define('Episode', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  seasonId: { // Foreign Key to Season
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  episodeNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  synopsis: {
    type: DataTypes.TEXT,
  },
  runtime: {
    type: DataTypes.STRING, // e.g. "45m"
  },
  airDate: {
    type: DataTypes.DATEONLY,
  },
  videoUrl: { // Source URL or Master Manifest
    type: DataTypes.STRING,
  },
  thumbnailUrl: {
    type: DataTypes.STRING,
  },
  manifestUrl: { // for HLS
    type: DataTypes.STRING,
  },
  posterUrl: { 
    type: DataTypes.STRING, 
  },
  tags: {
    type: DataTypes.JSON, // ['recap', 'battle']
  },
  isPremiere: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isFree: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // If true, playable without subscription
  },
  isFinale: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft',
  },
  subtitles: {
    type: DataTypes.JSON, // e.g., [{lang: 'en', url: '...'}]
  },
  audioTracks: {
    type: DataTypes.JSON, 
  },
  productionCode: {
    type: DataTypes.STRING,
  },
  spriteUrl: {
    type: DataTypes.STRING,
  },
  drmPolicy: {
    type: DataTypes.STRING, // e.g., 'widevine-cenc'
    allowNull: true,
  },
  restrictRegions: {
    type: DataTypes.JSON, // ['US', 'CA']
  },
  schedulePublish: {
    type: DataTypes.DATE,
  },
  renditions: {
    type: DataTypes.JSON, // List of generated qualities
  },
  seoMeta: {
    type: DataTypes.JSON, // { title: '', desc: '' }
  }
}, {
  timestamps: true,
});

module.exports = Episode;
