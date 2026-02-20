//get a user posts onto the html page
import { renderPosts, showError } from './frontend.js';

const username = localStorage.getItem('username');
document.addEventListener('DOMContentLoaded', () => {
  if (username) document.querySelectorAll('.profile').forEach((el) => (el.textContent = username));
});

async function loadUserPosts() {
  try {
    const res = await fetch(`/api/posts/user/${username}`);
    const profileNameElem = document.getElementById('username');
    if (!res.ok) {
      showError(`Failed to fetch user posts: ${res.status} ${res.statusText}`);
      return;
    }
    const posts = await res.json();
    profileNameElem.innerHTML = `<h2>${username}</h2>`;
    renderPosts(posts);
  } catch (err) {
    showError('Failed to load user posts.');
  }
}

loadUserPosts();

const newPostForm = document.getElementById('new-post-form');
if (newPostForm) {
  newPostForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return alert('Please log in to create a post.');

    const title = document.getElementById('post-title').value.trim();
    const content = document.getElementById('post-content').value.trim();
    const articleUrl = document.getElementById('post-articleUrl').value.trim() || null;
    const category = document.getElementById('post-category').value;

    if (!title || !content || !category) return alert('Title, content and category are required.');

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, title, content, articleUrl, category }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return alert(`Failed to create post: ${err.error || res.status}`);
      }
      // clear form and reload posts
      newPostForm.reset();
      loadUserPosts();
    } catch (err) {
      console.error(err);
      alert('Failed to create post.');
    }
  });
}
