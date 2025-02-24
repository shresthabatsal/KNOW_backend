const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const Article = require('./articleModel');
const User = require('./userModel');

const ArticleView = sequelize.define('ArticleView', {
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
  },
  articleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Article,
      key: 'id',
    },
  },
  viewedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

// Define associations after both models are imported
Article.hasMany(ArticleView, { foreignKey: 'articleId' });
ArticleView.belongsTo(Article, { foreignKey: 'articleId' });
ArticleView.belongsTo(User, { foreignKey: 'userId' });

module.exports = ArticleView;