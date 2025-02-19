const SavedArticle = require('../models/savedArticleModel');
const Article = require('../models/articleModel');
const Author = require('../models/authorModel');

// Save an article
const saveArticle = async (req, res) => {
  try {
    const userId = req.user.id; // Get userId from authenticated session
    const { articleId } = req.body;

    // Check if the article exists
    const article = await Article.findByPk(articleId);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check if the user already saved the article
    const existingSave = await SavedArticle.findOne({ where: { userId, articleId } });
    if (existingSave) {
      return res.status(400).json({ message: 'Article already saved' });
    }

    // Save the article
    const savedArticle = await SavedArticle.create({
      userId,
      articleId,
      authorId: article.authorId,
    });

    res.status(201).json({ message: 'Article saved successfully', savedArticle });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Fetch saved articles for a logged-in user
const getSavedArticles = async (req, res) => {
    try {
      const userId = req.user.id; // Get userId from authenticated session
  
      const savedArticles = await SavedArticle.findAll({
        where: { userId },
        include: [
          {
            model: Article,
            attributes: ['id', 'title', 'cover_image', 'summary', 'content', 'category', 'createdAt'],
            include: {
              model: Author,
              attributes: ['id', 'name'],
            },
          },
        ],
        order: [['savedAt', 'DESC']],
      });
  
      res.status(200).json({ savedArticles });
    } catch (error) {
      console.error("Error fetching saved articles:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };  

// Unsave an article
const unsaveArticle = async (req, res) => {
  try {
    const userId = req.user.id; // Get userId from authenticated session
    const { articleId } = req.body;

    const deleted = await SavedArticle.destroy({
      where: { userId, articleId },
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Saved article not found' });
    }

    res.status(200).json({ message: 'Article unsaved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { saveArticle, getSavedArticles, unsaveArticle };