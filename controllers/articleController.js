const Article = require('../models/articleModel');
const Author = require('../models/authorModel');
const fs = require('fs');
const path = require('path');

// Create an article
const createArticle = async (req, res) => {
  const { title, summary, content, category, tags } = req.body;
  const coverImage = req.file ? req.file.filename : null;

  if (!req.user || !req.user.id) {
    return res.status(400).json({ error: 'User is not authenticated or userId is missing' });
  }

  // Check if the logged-in user is a regular user and not an author/admin
  if (req.user.role === 'user') {
    return res.status(403).json({ error: 'Users are not allowed to create articles' });
  }

  try {
    const authorId = req.user.id;

    // Ensure tags is an array before creating the article
    const tagsArray = Array.isArray(tags) ? tags : tags ? [tags] : [];

    const newArticle = await Article.create({
      title,
      cover_image: coverImage,
      summary,
      content,
      category,
      tags: tagsArray, // Ensure tags is an array
      authorId: authorId,
      status: 'draft',
    });

    res.status(201).json(newArticle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create article' });
  }
};

// Update an article
const updateArticle = async (req, res) => {
  const { id } = req.params;
  const { title, summary, content, category, tags } = req.body;
  const coverImage = req.file ? req.file.filename : null;

  try {
    const article = await Article.findByPk(id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Only the author or admin can update the article
    if (article.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: You are not authorized to update this article' });
    }

    // Ensure tags is an array before updating the article
    const tagsArray = Array.isArray(tags) ? tags : tags ? [tags] : [];

    await article.update({
      title,
      summary,
      content,
      category,
      tags: tagsArray, // Ensure tags is an array
      cover_image: coverImage || article.cover_image,
    });

    res.status(200).json(article);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update article' });
  }
};


// Delete an article
const deleteArticle = async (req, res) => {
  const { id } = req.params;

  try {
    const article = await Article.findByPk(id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Only the author or admin can delete the article
    if (article.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: You are not authorized to delete this article' });
    }

    // If there is a cover image, delete it from the file system
    if (article.cover_image) {
      const imagePath = path.join(__dirname, '..', 'uploads', article.cover_image);

      // Check if file exists before attempting to delete
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error deleting cover image:', err);
        } else {
          console.log('Cover image deleted:', article.cover_image);
        }
      });
    }

    // Delete the article
    await article.destroy();
    res.status(200).json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
};

// Fetch articles by authorId
const getArticlesByAuthorId = async (req, res) => {
  const { authorId } = req.params;

  try {
    const articles = await Article.findAll({
      where: { authorId },
    });
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch articles by author' });
  }
};

// Get all articles
const getAllArticles = async (req, res) => {
  try {
    const articles = await Article.findAll({
      include: {
        model: Author,
        attributes: ['id', 'name', 'email'], // Include author details
      },
      order: [['createdAt', 'DESC']], // Sort by latest first
    });
    res.status(200).json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
};

// Get a single article by ID
const getArticleById = async (req, res) => {
  const { id } = req.params;

  try {
    const article = await Article.findByPk(id, {
      include: {
        model: Author,
        attributes: ['id', 'name', 'email'],
      },
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.status(200).json(article);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
};

// Fetch articles by category
const getArticlesByCategory = async (req, res) => {
  const { category } = req.params;

  try {
    const articles = await Article.findAll({
      where: { category },
      include: {
        model: Author,
        attributes: ['id', 'name', 'email'],
      },
      order: [['createdAt', 'DESC']],
    });

    if (articles.length === 0) {
      return res.status(404).json({ error: 'No articles found for this category' });
    }

    res.status(200).json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch articles by category' });
  }
};

module.exports = {
  createArticle,
  updateArticle,
  deleteArticle,
  getArticlesByAuthorId,
  getAllArticles,
  getArticleById,
  getArticlesByCategory,
};