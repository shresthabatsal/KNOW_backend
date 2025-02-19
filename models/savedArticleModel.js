const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const User = require('./userModel');
const Article = require('./articleModel');
const Author = require('./authorModel');

const SavedArticle = sequelize.define('SavedArticle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  articleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Article,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Author,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  savedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {});

// Associations
SavedArticle.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
SavedArticle.belongsTo(Article, { foreignKey: "articleId", onDelete: "CASCADE" });
SavedArticle.belongsTo(Author, { foreignKey: "authorId", onDelete: "CASCADE" });

Article.hasMany(SavedArticle, { foreignKey: "articleId", onDelete: "CASCADE" });

module.exports = SavedArticle;