const API_BASE = '/api';

export async function apiGet(endpoint) {
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { headers });
  if (!res.ok) throw new Error(`GET ${endpoint} failed: ${res.status}`);
  return res.json();
}

export async function apiPost(endpoint, body) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${endpoint} failed: ${res.status}`);
  return res.json();
}

export async function apiPut(endpoint, body) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${endpoint} failed: ${res.status}`);
  return res.json();
}

export async function apiDelete(endpoint) {
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error(`DELETE ${endpoint} failed: ${res.status}`);
  return res.json();
}

// Refresh the access token using the refresh token
export async function refreshToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refresh token available.');

  const res = await fetch(`${API_BASE}/users/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`);

  const data = await res.json();
  localStorage.setItem('token', data.token);
  return data.token;
}
