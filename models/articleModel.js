const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const User = require('./userModel');

const Article = sequelize.define('Article', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
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
    type: DataTypes.ARRAY(DataTypes.STRING), // Array of strings for tags
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'draft', // default status is 'draft'
  },
}, {});

Article.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' }); // Foreign key to User

module.exports = Article;