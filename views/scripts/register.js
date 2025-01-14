document.querySelector('.register-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Предотвращаем стандартное поведение формы

    const login = document.querySelector('.register-login').value.trim(); // Получаем логин
    const password = document.querySelector('.register-password').value.trim(); // Получаем пароль
    const modal = document.querySelector('.register-modal'); // Модальное окно для сообщений

    try {
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login, password }),
        });

        const result = await response.json();

        if (response.ok) {
            // Показываем успешное сообщение и сохраняем токен
            modal.innerText = "Регистрация успешна! Переход на главную страницу...";
            modal.showModal();

            // Сохраняем токен в localStorage
            if (result.token) {
                localStorage.setItem('token', result.token);
            }

            // Перенаправляем на главную страницу через 2 секунды
            setTimeout(() => {
                modal.close();
                window.location.href = '/';
            }, 2000);
        } else {
            // Показываем сообщение об ошибке
            modal.innerText = result.message || 'Ошибка регистрации';
            modal.showModal();
        }
    } catch (err) {
        modal.innerText = 'Произошла ошибка. Попробуйте снова.';
        modal.showModal();
    }
});
