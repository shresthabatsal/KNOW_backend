const Article = require('../models/articleModel');
const Author = require('../models/authorModel');
const ArticleView = require('../models/articleViewModel');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Create an article
const createArticle = async (req, res) => {
  const { title, summary, content, category, tags, status } = req.body;
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

    // Parse tags into an array
    let tagsArray = [];
    if (typeof tags === 'string') {
      tagsArray = tags.split(',').map(tag => tag.trim());
    } else if (Array.isArray(tags)) {
      tagsArray = tags.map(tag => tag.trim());
    }

    const newArticle = await Article.create({
      title,
      cover_image: coverImage,
      summary,
      content,
      category,
      tags: tagsArray, // Save tags as an array
      status,
      authorId: authorId,
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
  const { title, summary, content, category, tags, status } = req.body;
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

    // Parse tags into an array
    let tagsArray = [];
    if (typeof tags === 'string') {
      tagsArray = tags.split(',').map(tag => tag.trim());
    } else if (Array.isArray(tags)) {
      tagsArray = tags.map(tag => tag.trim());
    }

    await article.update({
      title,
      summary,
      content,
      category,
      tags: tagsArray, // Save tags as an array
      cover_image: coverImage || article.cover_image,
      status,
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

// Search articles by query
const searchArticles = async (req, res) => {
  const { query } = req.query; // Get the search query from the URL query parameters

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const articles = await Article.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } }, // Case-insensitive search in title
          { summary: { [Op.iLike]: `%${query}%` } }, // Case-insensitive search in summary
          { content: { [Op.iLike]: `%${query}%` } }, // Case-insensitive search in content
          { category: { [Op.iLike]: `%${query}%` } }, // Case-insensitive search in category
          { tags: { [Op.contains]: [query] } }, // Search in tags array
        ],
      },
      include: {
        model: Author,
        attributes: ['id', 'name', 'email'],
      },
      order: [['createdAt', 'DESC']], // Sort by latest first
    });

    if (articles.length === 0) {
      return res.status(404).json({ error: 'No articles found matching your search' });
    }

    res.status(200).json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to search articles' });
  }
};

// Track article view
const trackArticleView = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Check if the user has already viewed the article
    const existingView = await ArticleView.findOne({
      where: { userId, articleId: id },
    });

    if (!existingView) {
      // Record the view if it doesn't exist
      await ArticleView.create({ userId, articleId: id });
    }

    res.status(200).json({ message: 'Article view tracked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to track article view' });
  }
};

// Get personalized articles for the logged-in user
const getPersonalizedArticles = async (req, res) => {
  const userId = req.user.id; // Ensure this is correctly extracted

  console.log('User ID:', userId); // Debugging: Log the user ID

  try {
    // Fetch all published articles
    const allArticles = await Article.findAll({
      where: { status: 'Published' },
      include: {
        model: Author,
        attributes: ['id', 'name', 'email'],
      },
      order: [['createdAt', 'DESC']], // Sort by latest first
    });

    console.log('All published articles:', allArticles.length); // Debugging: Log the number of articles

    // Fetch articles viewed by the user
    const viewedArticles = await ArticleView.findAll({
      where: { userId },
      attributes: ['articleId'],
    });

    console.log('Viewed articles:', viewedArticles.length); // Debugging: Log the number of viewed articles

    // Extract IDs of viewed articles
    const viewedArticleIds = viewedArticles.map((view) => view.articleId);

    // Filter out articles already viewed by the user
    const unviewedArticles = allArticles.filter(
      (article) => !viewedArticleIds.includes(article.id)
    );

    console.log('Unviewed articles:', unviewedArticles.length); // Debugging: Log the number of unviewed articles

    // If no view data is found, return all published articles
    if (viewedArticleIds.length === 0) {
      console.log('No view data found. Returning all published articles.'); // Debugging
      return res.status(200).json(allArticles);
    }

    // Analyze user's viewing habits
    const userViews = await ArticleView.findAll({
      where: { userId },
      include: {
        model: Article,
        attributes: ['category', 'tags'],
      },
    });

    console.log('User views:', userViews.length); // Debugging: Log the number of user views

    // Calculate frequency of categories and tags
    const categoryFrequency = {};
    const tagFrequency = {};

    userViews.forEach((view) => {
      const category = view.Article.category;
      const tags = view.Article.tags;

      // Count category frequency
      if (categoryFrequency[category]) {
        categoryFrequency[category]++;
      } else {
        categoryFrequency[category] = 1;
      }

      // Count tag frequency
      if (tags) {
        tags.forEach((tag) => {
          if (tagFrequency[tag]) {
            tagFrequency[tag]++;
          } else {
            tagFrequency[tag] = 1;
          }
        });
      }
    });

    console.log('Category frequency:', categoryFrequency); // Debugging
    console.log('Tag frequency:', tagFrequency); // Debugging

    // Sort categories and tags by frequency
    const sortedCategories = Object.keys(categoryFrequency).sort(
      (a, b) => categoryFrequency[b] - categoryFrequency[a]
    );
    const sortedTags = Object.keys(tagFrequency).sort(
      (a, b) => tagFrequency[b] - tagFrequency[a]
    );

    console.log('Sorted categories:', sortedCategories); // Debugging
    console.log('Sorted tags:', sortedTags); // Debugging

    // Prioritize articles based on user preferences
    const prioritizedArticles = unviewedArticles.sort((a, b) => {
      const aCategoryScore = sortedCategories.indexOf(a.category);
      const bCategoryScore = sortedCategories.indexOf(b.category);

      const aTagScore = a.tags
        ? a.tags.reduce((sum, tag) => sum + (sortedTags.indexOf(tag) !== -1 ? 1 : 0), 0)
        : 0;
      const bTagScore = b.tags
        ? b.tags.reduce((sum, tag) => sum + (sortedTags.indexOf(tag) !== -1 ? 1 : 0), 0)
        : 0;

      // Higher score means higher priority
      return bCategoryScore + bTagScore - (aCategoryScore + aTagScore);
    });

    console.log('Prioritized articles:', prioritizedArticles.length); // Debugging

    // Combine prioritized articles with viewed articles
    const finalArticles = [...prioritizedArticles, ...allArticles.filter(
      (article) => viewedArticleIds.includes(article.id)
    )];

    console.log('Final articles:', finalArticles.length); // Debugging

    res.status(200).json(finalArticles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch personalized articles' });
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
  searchArticles,
  trackArticleView,
  getPersonalizedArticles
};
