const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/', verifyToken, newsController.getNews);

module.exports = router;
