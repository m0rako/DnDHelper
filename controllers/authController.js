const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const SECRET_KEY = 'your_secret_key';

module.exports = {
    // Регистрация пользователя
    async register(req, res) {
        const { login, password } = req.body;

        try {
            // Проверяем, существует ли пользователь
            const existingUser = await userModel.findUserByLogin(login);
            if (existingUser) {
                return res.status(400).json({ message: 'Пользователь с таким логином уже существует' });
            }

            // Создаём нового пользователя
            const passwordHash = await bcrypt.hash(password, 10);
            const newUser = await userModel.createUser(login, passwordHash);

            // Генерируем токен авторизации
            const token = jwt.sign(
                { userId: newUser.user_id, login: newUser.login },
                SECRET_KEY,
                { expiresIn: '4h' }
            );

            res.json({
                message: 'Регистрация успешна',
                token, // Передаём токен клиенту
                user: { login: newUser.login },
            });
        } catch (err) {
            console.error('Ошибка регистрации:', err);
            res.status(500).json({ message: 'Ошибка регистрации. Попробуйте позже.' });
        }
    },

    // Авторизация пользователя
    async login(req, res) {
        const { login, password } = req.body;
        try {
            const user = await userModel.findUserByLogin(login);

            if (!user || !(await bcrypt.compare(password, user.password_hash))) {
                return res.status(401).json({ message: 'Неверный логин или пароль' });
                
            }

            const token = jwt.sign(
                { userId: user.user_id, login: user.login, username: user.username || 'Игрок' },
                SECRET_KEY,
                { expiresIn: '4h' }
            );

            res.json({ message: 'Авторизация успешна', token, user });
        } catch (err) {
            console.error('Ошибка авторизации:', err);
            res.status(500).json({ message: 'Ошибка авторизации. Попробуйте позже.' });
        }
    },

    // Обновление имени пользователя
    async updateProfile(req, res) {
        const { username } = req.body;
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) return res.status(401).json({ message: 'Не авторизован' });

        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            const login = decoded.login;

            const updatedUser = await userModel.updateUserProfile(login, username);

            res.json({ message: 'Имя пользователя обновлено', user: updatedUser });
        } catch (err) {
            console.error('Ошибка обновления профиля:', err);
            res.status(500).json({ message: 'Ошибка обновления профиля' });
        }
    },
};
