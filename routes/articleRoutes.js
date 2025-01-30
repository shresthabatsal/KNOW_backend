const express = require('express');
const { createArticle, getAllArticles, getArticleById, getArticlesByCategory, getArticlesByTag, 
    getArticlesByUserId, updateArticle, deleteArticle } = require('../controllers/articleController');
const authenticateUser = require('../middleware/authMiddleware'); // Import the middleware

const router = express.Router();

// Only authenticated users can create, update, and delete articles
router.post('/articles', authenticateUser, createArticle);
router.get('/articles', authenticateUser, getAllArticles);
router.get('/articles/:id', authenticateUser, getArticleById);
router.get('/articles/category/:category', authenticateUser, getArticlesByCategory);
router.get('/articles/tag/:tags', authenticateUser, getArticlesByTag);
router.get('/articles/user/:userId', authenticateUser, getArticlesByUserId);
router.put('/articles/:id', authenticateUser, updateArticle);
router.delete('/articles/:id', authenticateUser, deleteArticle);

module.exports = router;