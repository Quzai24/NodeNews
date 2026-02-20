const registerSubmit = document.getElementById('register');

registerSubmit.addEventListener('click', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const repassword = document.getElementById('repassword').value;

  try {
    console.log(1, username, password, repassword);
    const res = await fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, repassword }),
    });
    console.log(2);
    if (!res.ok) {
      const errorData = await res.json();
      alert(`Registration failed: ${errorData.error}`);
      return;
    }
    alert('Registration successful!');
    window.location.href = '/index.html';
  } catch (err) {
    alert('Registration failed: An error occurred.');
  }
});
