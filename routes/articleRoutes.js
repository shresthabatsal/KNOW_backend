const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const articleController = require('../controllers/articleController');
const { getAllArticles, getArticleById, getArticlesByCategory } = require('../controllers/articleController');

// Article Routes
router.post('/articles', authenticateUser, upload.single('cover_image'), articleController.createArticle);
router.put('/articles/:id', authenticateUser, articleController.updateArticle);
router.delete('/articles/:id', authenticateUser, articleController.deleteArticle);
router.get('/articles/author/:authorId', authenticateUser, articleController.getArticlesByAuthorId);
router.get('/articles', authenticateUser, getAllArticles);
router.get('/articles/:id', getArticleById);
router.get('/articles/category/:category', getArticlesByCategory);

module.exports = router;