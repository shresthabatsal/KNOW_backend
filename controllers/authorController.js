const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Author = require('../models/authorModel');

// Register author
const registerAuthor = async (req, res) => {
    const { name, email, password } = req.body;
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newAuthor = await Author.create({ name, email, password: hashedPassword });
  
      // Use "authorId" and include role in the token
      const token = jwt.sign(
        { authorId: newAuthor.id, role: 'author' }, 
        'your_jwt_secret', 
        { expiresIn: '1h' }
      );
  
      res.status(201).json({ author: newAuthor, token });
    } catch (error) {
      res.status(500).json({ error: 'Failed to register author' });
    }
  };  

// Login author
const loginAuthor = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const author = await Author.findOne({ where: { email } });
  
      if (!author) {
        return res.status(404).json({ error: 'Author not found' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, author.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Invalid password' });
      }
  
      // Ensure token contains "authorId" and "role"
      const token = jwt.sign(
        { authorId: author.id, role: 'author' }, 
        'your_jwt_secret', 
        { expiresIn: '1h' }
      );
  
      res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  };
  

// Fetch author profile
const getAuthorProfile = async (req, res) => {
  const { id } = req.params;

  console.log('Fetching author profile for ID:', id); // Debugging

  if (!id) {
    return res.status(400).json({ error: 'Author ID is required' });
  }

  try {
    const author = await Author.findByPk(id);

    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }

    res.status(200).json(author);
  } catch (error) {
    console.error('Error fetching author profile:', error); // Debugging
    res.status(500).json({ error: 'Failed to fetch author profile' });
  }
};

// Update author profile
const updateAuthorProfile = async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;

  try {
    const author = await Author.findByPk(id);

    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : author.password;

    await author.update({ name, email, password: hashedPassword });

    res.status(200).json(author);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update author profile' });
  }
};

const updateAuthorPassword = async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  try {
    const author = await Author.findByPk(id);

    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, author.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await author.update({ password: hashedPassword });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
};

// Delete author
const deleteAuthor = async (req, res) => {
  const { id } = req.params;

  try {
    const author = await Author.findByPk(id);

    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }

    await author.destroy();

    res.status(200).json({ message: 'Author deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete author' });
  }
};

module.exports = { registerAuthor, loginAuthor, getAuthorProfile, updateAuthorProfile, updateAuthorPassword, deleteAuthor };