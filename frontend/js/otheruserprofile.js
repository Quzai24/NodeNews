import { apiGet, apiPost, apiPut, apiDelete } from './api.js';

const postContainer = document.getElementById('post-container');
const params = new URLSearchParams(window.location.search);
const username = params.get('username');
const ourUsername = localStorage.getItem('username');
const token = localStorage.getItem('token');

document.addEventListener('DOMContentLoaded', () => {
  if (ourUsername)
    document.querySelectorAll('.profile').forEach((el) => (el.textContent = ourUsername));
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
              <a href="./otheruserpage.html?username=${post.author || post.username || 'Unknown'}" class="name user-link">${post.author || post.username || 'Unknown'}</a>
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
                <p class="article-title">${post.articleUrl}</p>
              </a>
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
    const profileNameElem = document.getElementById('username');
    if (!res.ok) {
      showError(`Failed to fetch user posts: ${res.status} ${res.statusText}`);
      return;
    }
    const posts = await res.json();
    profileNameElem.innerHTML = `<h2>${username}</h2>`;
    postContainer.innerHTML = '';
    renderPosts(posts);
  } catch (err) {
    showError('Failed to load user posts.');
  }
}

loadUserPosts();
