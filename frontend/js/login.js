// connect the form inputs and buttons to the backend API for login and registration
const loginSubmit = document.getElementById('login');

loginSubmit.addEventListener('click', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      alert(`Login failed: ${errorData.error}`);
      return;
    }
    const data = await res.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    // store username for sidebar/profile display
    if (data.user && data.user.username) {
      localStorage.setItem('username', data.user.username);
    }
        // continue to index page on successful registration without alert
    alert('Login successful!');
    // add the username to the user profile page
    window.location.href = '/index.html';
  } catch (err) {
    alert('Login failed: An error occurred.');
  }
});
