const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middlewares/authMiddleware');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Карта подключённых пользователей: login -> данные пользователя
const loggedInUsers = new Map();
const disconnectTimeouts = new Map(); // Хранилище таймаутов для отключённых пользователей

app.use(express.json()); // Позволяет обрабатывать JSON-тела запросов
app.use(express.static(path.join(__dirname, 'views'))); // Статические файлы из папки "views"

// Роуты авторизации и регистрации
app.use('/auth', authRoutes);

// Главная страница (защищена middleware)
app.get('/', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Страница авторизации
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'authorization.html'));
});

// Страница регистрации
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html')); // Отправляем HTML-файл регистрации
});

// API для получения текущего пользователя
app.get('/current-user', authMiddleware, (req, res) => {
    const user = loggedInUsers.get(req.user.login);
    res.json({ login: req.user.login, username: user?.username || req.user.username || 'Игрок' });
});

// Обработка подключения через Socket.IO
io.on('connection', (socket) => {
    console.log('Новое подключение:', socket.id);

    // Пользователь входит в систему
    socket.on('user_logged_in', (user) => {
        // Удаляем таймаут, если пользователь переподключился
        if (disconnectTimeouts.has(user.login)) {
            clearTimeout(disconnectTimeouts.get(user.login));
            disconnectTimeouts.delete(user.login);
        }

        loggedInUsers.set(user.login, { ...user, socketId: socket.id }); // Добавляем или обновляем данные пользователя
        io.emit('update_users', Array.from(loggedInUsers.values())); // Обновляем список для всех
    });

    // Обработка изменения имени пользователя
    socket.on('username_updated', (updatedUser) => {
        if (loggedInUsers.has(updatedUser.login)) {
            loggedInUsers.set(updatedUser.login, updatedUser); // Обновляем данные пользователя
            io.emit('update_users', Array.from(loggedInUsers.values())); // Обновляем список для всех
        }
    });

    // Обработка отключения клиента
    socket.on('disconnect', () => {
        const user = Array.from(loggedInUsers.values()).find((u) => u.socketId === socket.id);

        if (user) {
            // Устанавливаем таймаут для удаления пользователя
            const timeout = setTimeout(() => {
                loggedInUsers.delete(user.login);
                disconnectTimeouts.delete(user.login);
                io.emit('update_users', Array.from(loggedInUsers.values())); // Обновляем список
                console.log(`Пользователь ${user.login} удалён из списка`);
            }, 5000); // 5 секунд на переподключение

            disconnectTimeouts.set(user.login, timeout); // Сохраняем таймаут
        }
    });

    // Обработка выхода пользователя
    socket.on('user_logged_out', (login) => {
        loggedInUsers.delete(login); // Удаляем пользователя
        io.emit('update_users', Array.from(loggedInUsers.values())); // Обновляем список
    });

});

// Запуск сервера
const PORT = 3000;
server.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));
