import { apiGet } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const username = localStorage.getItem('username');
  if (username) document.querySelectorAll('.profile').forEach(el => (el.textContent = username));
});

const recentList = document.getElementById('recent-list');
const buttons = document.querySelectorAll('.period-buttons button');

// Load recent posts for a time period
async function loadRecent(period) {
  recentList.innerHTML = '<p class="text-center text-muted">Loading...</p>';

  try {
    const data = await apiGet(`/recent?period=${period}`);
    const posts = data.posts || data;

    if (posts.length === 0) {
      recentList.innerHTML = '<p class="text-muted">No recent posts for this period.</p>';
      return;
    }

    recentList.innerHTML = posts
      .map(
        (post, i) => `
        <a href="post.html?id=${post._id}" class="recent-post">
          <div class="recent-rank">#${i + 1}</div>
          <div class="recent-info">
            <h5>${post.title}</h5>
            <p>
              <span class="badge bg-secondary">${post.category || 'General'}</span>
              &bull; ${post.voteCount || 0} votes
              &bull; ${post.commentCount || 0} comments
              &bull; ${new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </a>
      `,
      )
      .join('');
  } catch (err) {
    recentList.innerHTML = '<p class="text-danger">Failed to load recent posts.</p>';
  }
}

// Handle period button clicks
buttons.forEach((btn) => {
  btn.addEventListener('click', () => {
    buttons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    loadRecent(btn.dataset.period);
  });
});

// Load today's recent on page load
loadRecent('today');
