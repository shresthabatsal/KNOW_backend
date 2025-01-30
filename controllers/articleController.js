const Article = require('../models/articleModel');
const User = require('../models/userModel');

// Create an article
const createArticle = async (req, res) => {
  const { title, summary, content, category, tags } = req.body;
  console.log('Request user:', req.user); // Debug
  
  if (!req.user || !req.user.id) {
    return res.status(400).json({ error: 'User is not authenticated or userId is missing' });
  }

  try {
    const userId = req.user.id;  // Extract userId from req.user
    console.log('Final userId being used:', userId); // Debugging log

    const newArticle = await Article.create({
      title,
      summary,
      content,
      category,
      tags,
      userId: Number(userId), // Convert to an integer
      status: 'draft',
    });

    console.log('Inserted article with userId:', newArticle.userId); // Verify what gets inserted
    res.status(201).json(newArticle);
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: 'Failed to create article' });
  }
};

// Get all articles
const getAllArticles = async (req, res) => {
  try {
    const articles = await Article.findAll();
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
};

// Get a single article by ID
const getArticleById = async (req, res) => {
  const { id } = req.params;

  try {
    const article = await Article.findByPk(id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.status(200).json(article);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch article' });
  }
};

// Update an article
const updateArticle = async (req, res) => {
  const { id } = req.params;
  const { title, summary, content, category, tags } = req.body;

  try {
    const article = await Article.findByPk(id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Only the author or admin can update an article
    if (article.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: You are not authorized to update this article' });
    }

    await article.update({ title, summary, content, category, tags });
    res.status(200).json(article);
  } catch (error) {
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

    // Only the author or admin can delete an article
    if (article.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: You are not authorized to delete this article' });
    }

    await article.destroy();
    res.status(200).json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete article' });
  }
};

// Fetch articles by category
const getArticlesByCategory = async (req, res) => {
  const { category } = req.params;

  try {
    const articles = await Article.findAll({
      where: { category },
    });
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch articles by category' });
  }
};

// Fetch articles by tag
const getArticlesByTag = async (req, res) => {
  const { tags } = req.params;

  try {
    const articles = await Article.findAll({
      where: {
        tags: {
          [Sequelize.Op.contains]: [tags], // Using Sequelize's array containment operator
        },
      },
    });
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch articles by tag' });
  }
};

// Fetch articles by userId
const getArticlesByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const articles = await Article.findAll({
      where: { userId },
    });
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch articles by user' });
  }
};

module.exports = {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  getArticlesByCategory,
  getArticlesByTag,
  getArticlesByUserId,
};