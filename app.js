const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const express = require('express');

const app = express();

// Security headers
app.use(helmet());

// Global rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (to be implemented)
const userRoutes = require('./routes/users');
const newsRoutes = require('./routes/news');

app.use('/users', userRoutes);
app.use('/news', newsRoutes);

app.get('/', (req, res) => {
    res.send('News Aggregator API');
});

module.exports = app;
