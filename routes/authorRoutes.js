const express = require('express');
const authenticateUser = require('../middleware/authMiddleware');
const { registerAuthor, loginAuthor, getAuthorProfile, 
    updateAuthorProfile, updateAuthorPassword, deleteAuthor, getAuthorAnalytics } = require('../controllers/authorController');

const router = express.Router();

router.post('/authors/register', registerAuthor);
router.post('/authors/login', loginAuthor);
router.get('/authors/:id', getAuthorProfile);
router.put('/authors/:id', authenticateUser, updateAuthorProfile);
router.put('/authors/:id/password', updateAuthorPassword);
router.delete('/authors/:id', deleteAuthor);
router.get('/authors/:authorId/analytics', getAuthorAnalytics);

module.exports = router;