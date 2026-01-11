const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

router.get('/preferences', verifyToken, userController.getPreferences);
router.put('/preferences', verifyToken, userController.updatePreferences);

module.exports = router;
