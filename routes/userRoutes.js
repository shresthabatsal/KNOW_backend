// routes/userRoutes.js
const express = require('express');
const { registerUser, loginUser, getUserProfile, updateUserProfile, deleteUser } = require('../controllers/userController');
const router = express.Router();

router.post('/users/register', registerUser);
router.post('/users/login', loginUser);
router.get('/users/:id', getUserProfile);
router.put('/users/:id', updateUserProfile);
router.delete('/users/:id', deleteUser);

module.exports = router;