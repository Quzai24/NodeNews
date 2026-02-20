import { apiGet, apiPost, apiPut, apiDelete } from './api.js';

const params = new URLSearchParams(window.location.search);
const postId = params.get('id');
const token = localStorage.getItem('token');

// Load post
async function loadPost() {
  try {
    console.log('Loading post with ID:', postId);
    const post = await apiGet(`/posts/${postId}`);
    console.log('Post data:', post);

    document.getElementById('post-detail').innerHTML = `
      <div class="user-info">
        <img class="profile-pic" src="../sourceimages/user.png" alt="Profile Picture" />
        <div class="user-details">
          <p><strong>${post.username || 'Unknown'}</strong> &bull; ${new Date(post.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      <div class="post-content">
        <h3>${post.title}</h3>
        <span class="badge bg-secondary">${post.category || 'General'}</span>
        <p>${post.content}</p>
      </div>
      ${post.articleUrl ? `<a href="${post.articleUrl}" target="_blank" class="btn btn-outline-light btn-sm">Read Article &rarr;</a>` : ''}
      <div class="vote-buttons">
        <button class="btn btn-outline-light" id="upvote-btn">
          <img class="vote-icon" src="../sourceimages/up-arrow.svg" alt="Upvote" />
        </button>
        <button class="btn btn-outline-light" id="downvote-btn">
          <img class="vote-icon" src="../sourceimages/bottom-arrow.svg" alt="Downvote" />
        </button>
        <p id="vote-count">${post.voteCount || 0}</p>
      </div>
    `;

    document.getElementById('upvote-btn').addEventListener('click', () => vote(true));
    document.getElementById('downvote-btn').addEventListener('click', () => vote(false));
  } catch (err) {
    document.getElementById('post-detail').innerHTML =
      '<p class="text-danger">Failed to load post.</p>';
  }
}

// Vote
async function vote(value) {
  if (!token) return alert('Please log in to vote.');
  try {
    await apiPost('/votes', { postId, value });
    loadPost();
  } catch (err) {
    console.error('Vote failed:', err);
  }
}

// Load comments
async function loadComments() {
  try {
    const comments = await apiGet(`/comments/post/${postId}`);
    document.getElementById('comments-heading').textContent = `Comments (${comments.length})`;

    if (comments.length === 0) {
      document.getElementById('comments-list').innerHTML =
        '<p class="text-muted">No comments yet.</p>';
      return;
    }

    document.getElementById('comments-list').innerHTML = comments
      .map(
        (c) => `
        <div class="comment" data-id="${c._id}">
          <p><strong>${c.username || 'Unknown'}</strong> &bull; ${new Date(c.createdAt).toLocaleDateString()}</p>
          <p class="comment-body">${c.content}</p>
        </div>
      `,
      )
      .join('');
  } catch (err) {
    document.getElementById('comments-list').innerHTML =
      '<p class="text-danger">Failed to load comments.</p>';
  }
}

// Submit comment
document.getElementById('comment-submit').addEventListener('click', async () => {
  const input = document.getElementById('comment-input');
  const content = input.value.trim();
  if (!content) return;

  try {
    await apiPost('/comments', { postId, content });
    input.value = '';
    loadComments();
  } catch (err) {
    console.error('Failed to post comment:', err);
  }
});

// Show comment form only if logged in
if (token) {
  document.getElementById('comment-form-container').style.display = 'block';
}

loadPost();
loadComments();
