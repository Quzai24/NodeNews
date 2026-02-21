import { refreshToken } from './api.js';
import { apiGet, apiPost, apiPut, apiDelete } from './api.js';

const profileNameElem = document.getElementById('username');
const postContainer = document.getElementById('post-container');
const user = JSON.parse(localStorage.getItem('user') || 'null');
const username = user ? user.username : null;
const token = localStorage.getItem('token');

document.addEventListener('DOMContentLoaded', () => {
  if (username) document.querySelectorAll('.profile').forEach((el) => (el.textContent = username));
});

function showError(msg) {
  postContainer.innerHTML = `<div class="alert alert-danger">${msg}</div>`;
}

function renderPosts(posts) {
  if (posts.length === 0) {
    postContainer.innerHTML += '<p class="text-muted">No posts found.</p>';
    return;
  }
  postContainer.innerHTML += posts
    .map(
      (post) => `
      <div class="news-post">
        <div class="user-info">
          <a href="#" class="user-link">
            <img class="profile-pic" src="./sourceimages/user.png" alt="Profile Picture" />
          </a>
          <div class="user-details">
            <p>
              <a href="./userpage.html?username=${post.author || post.username || 'Unknown'}" class="name user-link">${post.author || post.username || 'Unknown'}</a>
              &bull; ${new Date(post.timestamp || post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div class="post-content">
          <a href="post.html?id=${post._id}" class="post-link">
            <h4>${post.title || ''}</h4>
          </a>
          <span class="badge bg-secondary">${post.category || 'General'}</span>
          <p>${post.content}</p>
        </div>
        ${
          post.articleUrl
            ? `
          <div class="article-reference">
            <div class="article-details">
              <a href="${post.articleUrl}" target="_blank" class="article-link">
                <p class="article-title">${post.articleUrl}</p>\n              </a>
            </div>
          </div>
        `
            : ''
        }
        <div class="vote-buttons">
          <button class="btn btn-outline-light upvote-btn" data-post-id="${post._id}">
            <img class="vote-icon" src="./sourceimages/up-arrow.svg" alt="Upvote" />
          </button>
          <p class="vote-count">${post.voteCount || 0}</p>
          <button class="btn btn-outline-light downvote-btn" data-post-id="${post._id}">
            <img class="vote-icon" src="./sourceimages/bottom-arrow.svg" alt="Downvote" />
          </button>
          <p>${post.commentCount || 0} comments</p>
        </div>
      </div>
    `,
    )
    .join('');

  // Attach vote button listeners
  document.querySelectorAll('.upvote-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const postId = btn.dataset.postId;
      vote(postId, true);
    });
  });
  document.querySelectorAll('.downvote-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const postId = btn.dataset.postId;
      vote(postId, false);
    });
  });
}

async function vote(postId, value) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please log in to vote.');
    return;
  }
  try {
    await apiPost('/votes', { postId, value });
    loadUserPosts();
  } catch (err) {
    alert('Failed to record vote.');
    console.error('Vote failed:', err);
  }
}

async function loadUserPosts() {
  try {
    const res = await fetch(`/api/posts/user/${username}`);
    if (!res.ok) {
      showError(`Failed to fetch user posts: ${res.status} ${res.statusText}`);
      return;
    }
    const posts = await res.json();
    profileNameElem.innerHTML = `<h2>${username}</h2>`;
    postContainer.innerHTML = `
            <div class="new-post-form mb-4">
              <h4>Create a Post</h4>
              <form id="new-post-form">
                <div class="mb-2">
                  <input
                    type="text"
                    id="post-title"
                    class="form-control"
                    placeholder="Title"
                    required
                  />
                </div>
                <div class="mb-2">
                  <textarea
                    id="post-content"
                    class="form-control"
                    rows="4"
                    placeholder="Write your post..."
                    required
                  ></textarea>
                </div>
                <div class="mb-2">
                  <input
                    type="url"
                    id="post-articleUrl"
                    class="form-control"
                    placeholder="Optional article URL"
                  />
                </div>
                <div class="mb-2">
                  <select id="post-category" class="form-select" required>
                    <option value="">Select category</option>
                    <option value="health">Health</option>
                    <option value="tech">Tech</option>
                    <option value="politics">Politics</option>
                    <option value="world">World</option>
                    <option value="science">Science</option>
                  </select>
                </div>
                <div>
                  <button type="submit" class="btn btn-primary">Post</button>
                </div>
              </form>
            </div>
    `;
    renderPosts(posts);
  } catch (err) {
    console.log(err);
    showError('Failed to load user posts.');
  }
}

loadUserPosts();

async function PostForm() {
  const newPostForm = document.getElementById('new-post-form');
  if (newPostForm) {
    newPostForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!token) return alert('Please log in to create a post.');

      const title = document.getElementById('post-title').value.trim();
      const content = document.getElementById('post-content').value.trim();
      const articleUrl = document.getElementById('post-articleUrl').value.trim() || null;
      const category = document.getElementById('post-category').value;

      if (!title || !content || !category)
        return alert('Title, content and category are required.');

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
        if (err.message.includes('403')) {
          const newToken = await refreshToken();
          console.log('Token refreshed, try your request again');
          PostForm(); // Retry the form submission with the new token
          return;
        }
        console.error(err);
        alert('Failed to create post.');
      }
    });
  }
}

PostForm();
