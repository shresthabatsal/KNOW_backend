const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const Author = require('./authorModel');

const Article = sequelize.define('Article', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cover_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  summary: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'draft',
  },
});

Article.belongsTo(Author, { foreignKey: 'authorId', onDelete: 'CASCADE' });

module.exports = Article;