const jwt = require('jsonwebtoken');

if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error('Missing JWT_ACCESS_SECRET in environment variables');
}

const SECRET_KEY = process.env.JWT_ACCESS_SECRET;

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Malformed token' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Failed to authenticate token' });
        }
        req.user = decoded;
        next();
    });
};

module.exports = verifyToken;
