const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/register', authController.register); // Регистрация
router.post('/login', authController.login); // Авторизация
router.post('/update-profile', authController.updateProfile); // Обновление профиля

module.exports = router;
