const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key';

// Middleware для проверки токена авторизации
module.exports = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Извлекаем токен из заголовков

    if (!token) {
        return res.redirect('/login'); // Если токен отсутствует, перенаправляем на авторизацию
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY); // Проверяем токен
        req.user = decoded; // Сохраняем данные пользователя в объекте запроса
        next(); // Передаем управление следующему middleware
    } catch (err) {
        return res.redirect('/login'); // Если токен недействителен, перенаправляем на авторизацию
    }
};
