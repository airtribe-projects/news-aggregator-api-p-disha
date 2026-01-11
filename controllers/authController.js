const users = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Enforce environment variables
if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error('Missing JWT_ACCESS_SECRET or JWT_REFRESH_SECRET in environment variables');
}

const ACCESS_KEY = process.env.JWT_ACCESS_SECRET;
const REFRESH_KEY = process.env.JWT_REFRESH_SECRET;

// In-memory refresh token store (in production use Redis/DB)
let refreshTokens = [];

// Helper to generate tokens
const generateAccessToken = (user) => {
    return jwt.sign({ email: user.email, id: user.id }, ACCESS_KEY, { expiresIn: '15m' });
};

const generateRefreshToken = (user) => {
    return jwt.sign({ email: user.email, id: user.id }, REFRESH_KEY, { expiresIn: '7d' });
};

exports.signup = async (req, res) => {
    const { name, email, password, preferences } = req.body;

    // Strict Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!password || password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
        id: users.length + 1,
        name,
        email,
        password: hashedPassword,
        preferences: preferences || []
    };

    users.push(newUser);
    res.status(200).json({ message: 'User registered successfully' });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    refreshTokens.push(refreshToken);

    res.status(200).json({ token: accessToken, refreshToken });
};

exports.refreshToken = (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(401).json({ message: 'Refresh Token required' });
    }

    if (!refreshTokens.includes(token)) {
        return res.status(403).json({ message: 'Invalid Refresh Token' });
    }

    jwt.verify(token, REFRESH_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid Refresh Token' });
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(user);
        res.json({ token: newAccessToken });
    });
};

exports.logout = (req, res) => {
    const { token } = req.body;
    // Remove refresh token
    refreshTokens = refreshTokens.filter(t => t !== token);
    res.status(200).json({ message: 'Logout successful' });
};
