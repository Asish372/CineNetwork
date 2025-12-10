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
    allowNull: true,
  },
  posterUrl: {
    type: DataTypes.STRING, 
  },
  spriteUrl: {
    type: DataTypes.STRING, 
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  seasonCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  episodeCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
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
    status: {
        type: DataTypes.ENUM('draft', 'published', 'archived'),
        defaultValue: 'draft'
    },
    releaseDate: {
        type: DataTypes.DATEONLY
    },
    languages: {
        type: DataTypes.JSON, // ['English', 'Spanish']
        defaultValue: []
    },
    cast: {
        type: DataTypes.JSON, // [{ name: 'Actor', role: 'Hero' }]
        defaultValue: []
    },
    crew: {
        type: DataTypes.JSON, // [{ name: 'Director', role: 'Director' }]
        defaultValue: []
    },
    studio: {
        type: DataTypes.STRING
    },
    externalIds: {
        type: DataTypes.JSON // { imdb: 'tt123456' }
    },
    ageRating: {
        type: DataTypes.STRING // 'PG-13', 'R'
    },
    maturityFlags: {
        type: DataTypes.JSON // ['violence', 'language']
    },
    seoTitle: {
        type: DataTypes.STRING
    },
    seoDescription: {
        type: DataTypes.TEXT
    },
    visibility: {
        type: DataTypes.ENUM('public', 'private'),
        defaultValue: 'public'
    },
    collections: {
        type: DataTypes.JSON // ['featured', 'trending']
    },
    tags: {
        type: DataTypes.JSON // ['action', '90s']
    },
    countries: {
        type: DataTypes.JSON // ['US', 'IN']
    },
    primaryTitleMap: {
        type: DataTypes.JSON // { en: "Title", es: "Titulo" }
    },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  fakeViews: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  fakeLikes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  showFakeStats: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
});

module.exports = Content;
