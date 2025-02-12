const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authentication token is required' });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        console.log('Decoded token:', decoded); // Debugging

        if (decoded.role === 'user') {
            req.user = { id: decoded.userId, role: 'user' };
        } else if (decoded.role === 'author') {
            req.user = { id: decoded.authorId, role: 'author' };
        } else if (decoded.role === 'admin') {
            req.user = { id: decoded.adminId, role: 'admin' };
        } else {
            return res.status(401).json({ error: 'Invalid token structure' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = authenticateUser;