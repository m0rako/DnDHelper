const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres', // Ваш логин PostgreSQL
    host: 'localhost', // Хост базы данных
    database: 'dnd_database', // Имя базы данных
    password: 'postgres', // Пароль
    port: 5432, // Порт
});

// Проверка подключения
pool.connect()
    .then(() => console.log('Подключение к базе данных успешно установлено'))
    .catch((err) => console.error('Ошибка подключения к базе данных:', err));

module.exports = pool;
