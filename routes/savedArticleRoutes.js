const express = require('express');
const { saveArticle, getSavedArticles, unsaveArticle } = require('../controllers/savedArticleController');
const authenticateUser = require('../middleware/authMiddleware'); // Import authentication middleware

const router = express.Router();

// Protect all routes with authenticateUser
router.post('/save', authenticateUser, saveArticle);
router.get('/saved', authenticateUser, getSavedArticles);
router.delete('/unsave', authenticateUser, unsaveArticle);

module.exports = router;