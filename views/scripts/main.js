// Подключение к серверу через Socket.IO
const socket = io();

// Элементы интерфейса
const userListElement = document.querySelector('.user-list'); // Список пользователей
const profileMenu = document.querySelector('.profile-menu'); // Меню профиля
const dropdownMenu = document.querySelector('.dropdown-menu'); // Выпадающее меню профиля
const editProfileButton = document.querySelector('.edit-profile'); // Кнопка "Редактировать профиль"
const logoutButton = document.querySelector('.logout'); // Кнопка "Выйти"
const modal = document.querySelector('.modal'); // Модальное окно редактирования профиля
const closeModalButton = document.querySelector('.close-button'); // Кнопка закрытия модального окна
const saveProfileButton = document.querySelector('.save-button'); // Кнопка сохранения профиля
const usernameInput = document.querySelector('.profile-name-input'); // Поле ввода имени пользователя
const passwordInput = document.querySelector('.profile-password-input'); // Поле ввода пароля
const currentUserElement = document.querySelector('.current-user'); // Элемент имени текущего пользователя
const userLoginDisplay = document.querySelector('.user-login');
// Проверяем токен
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/login'; // Если токена нет, перенаправляем на авторизацию
}

// Функция для отображения меню
function showMenu() {
    dropdownMenu.style.display = 'block'; // Показываем меню
}

// Функция для скрытия меню
function hideMenu() {
    dropdownMenu.style.display = 'none'; // Скрываем меню
}

// Получение текущего пользователя
fetch('/current-user', {
    headers: { Authorization: `Bearer ${token}` }, // Передаём токен авторизации
})
    .then((response) => {
        if (!response.ok) throw new Error('Не авторизован');
        return response.json();
    })
    .then((data) => {
        const username = data.username || 'Игрок'; // Имя по умолчанию
        currentUserElement.textContent = username; // Отображаем имя
        usernameInput.value = username; // Заполняем поле ввода
        currentUserElement.dataset.login = data.login; // Сохраняем логин в атрибуте
        socket.emit('user_logged_in', { login: data.login, username }); // Уведомляем сервер
    })
    .catch(() => {
        localStorage.removeItem('token'); // Удаляем токен при ошибке
        window.location.href = '/login'; // Перенаправляем на авторизацию
    });

// Открытие модального окна
editProfileButton.addEventListener('click', () => {
     // Устанавливаем логин текущего пользователя
     userLoginDisplay.textContent = currentUserElement.dataset.login;
    modal.showModal(); // Показываем модальное окно
});

// Закрытие модального окна
closeModalButton.addEventListener('click', () => {
    modal.close(); // Закрываем модальное окно
});

// Сохранение изменений профиля
saveProfileButton.addEventListener('click', (e) => {
    e.preventDefault(); // Предотвращаем стандартное поведение формы

    const updatedUsername = usernameInput.value.trim() || 'Игрок'; // Получаем имя
    const updatedPassword = passwordInput.value.trim(); // Получаем пароль

    // Отправляем запрос на сервер
    fetch('/auth/update-profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: updatedUsername, password: updatedPassword }),
    })
        .then((response) => {
            if (!response.ok) throw new Error('Ошибка обновления профиля');
            return response.json();
        })
        .then(() => {
            currentUserElement.textContent = updatedUsername; // Обновляем имя на странице
            socket.emit('username_updated', { login: currentUserElement.dataset.login, username: updatedUsername }); // Уведомляем сервер о новом имени
            modal.close(); // Закрываем модальное окно
        })
        .catch((err) => alert(err.message));
});

// Обновление списка пользователей
socket.on('update_users', (users) => {
    userListElement.innerHTML = ''; // Очищаем список
    users.forEach((user) => {
        const li = document.createElement('li');
        li.textContent = user.username || user.login; // Отображаем username или login
        userListElement.appendChild(li);
    });
});

// Получаем уведомление от сервера об обновлении имени пользователя
socket.on('user_updated', (updatedUser) => {
    const listItems = userListElement.querySelectorAll('li');
    listItems.forEach((li) => {
        if (li.textContent === updatedUser.oldUsername) {
            li.textContent = updatedUser.username; // Обновляем имя в списке
        }
    });
});

// Обработка выхода из системы
logoutButton.addEventListener('click', () => {
    const login = currentUserElement.dataset.login; // Получаем логин пользователя
    socket.emit('user_logged_out', login); // Уведомляем сервер
    localStorage.removeItem('token'); // Удаляем токен
    window.location.href = '/login'; // Перенаправляем на авторизацию
});

// События для меню профиля
profileMenu.addEventListener('mouseenter', showMenu); // Показываем меню при наведении
profileMenu.addEventListener('mouseleave', (e) => {
    // Проверяем, ушла ли мышка с профиля или с меню
    const toElement = e.relatedTarget || e.toElement;
    if (!dropdownMenu.contains(toElement)) {
    setTimeout(hideMenu, 200); // Скрываем меню с задержкой
    }
});

dropdownMenu.addEventListener('mouseenter', showMenu); // Оставляем меню открытым при наведении
dropdownMenu.addEventListener('mouseleave', () => {
    setTimeout(hideMenu, 200); // Скрываем меню с задержкой
});
