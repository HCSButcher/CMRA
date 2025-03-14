const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const token = req.headers.authorization?.split('')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    jwt.verify(token, process.env.jwt_secret || 'your_jwt_secret', (err, user) => {
        if (err) return res.status(403).json({ message: 'Forbidden' });

        req.userEmail = user.Email;
        req.userRole = user.role;
        next();
    });
}

module.exports = authenticateToken;