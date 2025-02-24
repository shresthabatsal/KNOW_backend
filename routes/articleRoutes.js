const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const articleController = require('../controllers/articleController');
const { getAllArticles, getArticleById, getArticlesByCategory } = require('../controllers/articleController');

// Article Routes
router.post('/articles', authenticateUser, upload.single('cover_image'), articleController.createArticle);
router.put('/articles/:id', authenticateUser, upload.single('cover_image'), articleController.updateArticle);
router.delete('/articles/:id', authenticateUser, articleController.deleteArticle);
router.get('/articles/author/:authorId', authenticateUser, articleController.getArticlesByAuthorId);
router.get('/articles', getAllArticles);
router.get('/articles/personalized', authenticateUser, articleController.getPersonalizedArticles);
router.get('/articles/:id', getArticleById);
router.get('/articles/category/:category', getArticlesByCategory);
router.get('/search', articleController.searchArticles);
router.post('/articles/:id/view', authenticateUser, articleController.trackArticleView);

module.exports = router;