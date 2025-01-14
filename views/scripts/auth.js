document.querySelector('.auth-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const login = document.querySelector('.auth-login').value;
  const password = document.querySelector('.auth-password').value;

  const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password }),
  });

  const result = await response.json();
  const modal = document.querySelector('.auth-modal');

  if (response.ok) {
      // Сохраняем токен
      localStorage.setItem('token', result.token);
      window.location.href = '/'; // Переходим на главную страницу
  } else {
      modal.innerText = result.message;
      modal.showModal();

      setTimeout(() => {
        modal.close();
    }, 2000);
  }
});
