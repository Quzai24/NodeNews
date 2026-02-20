import { apiGet } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const username = localStorage.getItem('username');
  if (username) document.querySelectorAll('.profile').forEach(el => (el.textContent = username));
});

const trendingList = document.getElementById('trending-list');
const buttons = document.querySelectorAll('.period-buttons button');

// Load trending posts for a time period
async function loadTrending(period) {
  trendingList.innerHTML = '<p class="text-center text-muted">Loading...</p>';

  try {
    const data = await apiGet(`/trending?period=${period}`);
    const posts = data.posts || data;

    if (posts.length === 0) {
      trendingList.innerHTML = '<p class="text-muted">No trending posts for this period.</p>';
      return;
    }

    trendingList.innerHTML = posts
      .map(
        (post, i) => `
        <a href="post.html?id=${post._id}" class="trending-post">
          <div class="trending-rank">#${i + 1}</div>
          <div class="trending-info">
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
    trendingList.innerHTML = '<p class="text-danger">Failed to load trending posts.</p>';
  }
}

// Handle period button clicks
buttons.forEach((btn) => {
  btn.addEventListener('click', () => {
    buttons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    loadTrending(btn.dataset.period);
  });
});

// Load today's trending on page load
loadTrending('today');
