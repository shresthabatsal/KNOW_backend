const express = require('express');
const { registerAuthor, loginAuthor, getAuthorProfile, 
    updateAuthorProfile, deleteAuthor } = require('../controllers/authorController');

const router = express.Router();

router.post('/authors/register', registerAuthor);
router.post('/authors/login', loginAuthor);
router.get('/authors/:id', getAuthorProfile);
router.put('/authors/:id', updateAuthorProfile);
router.delete('/authors/:id', deleteAuthor);

module.exports = router;