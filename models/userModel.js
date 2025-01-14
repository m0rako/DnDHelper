const pool = require('../config/db');

// Модель для работы с базой данных
module.exports = {
    async createUser(login, passwordHash) {
        const result = await pool.query(
            'INSERT INTO users (login, password_hash) VALUES ($1, $2) RETURNING *',
            [login, passwordHash]
        );
        return result.rows[0];
    },

    async findUserByLogin(login) {
        const result = await pool.query('SELECT * FROM users WHERE login = $1', [login]);
        return result.rows[0];
    },

    async updateUserProfile(login, username) {
        const result = await pool.query(
            `UPDATE users SET username = $1 WHERE login = $2 RETURNING *`,
            [username, login]
        );
        return result.rows[0];
    },
};
