import { apiGet } from './api.js';

const postContainer = document.getElementById('post-container');
const categoryButtons = document.querySelectorAll('.category-btn');
const searchBar = document.querySelector('.search-bar');
const searchForm = document.querySelector('.search-container form');

let activeCategory = '';

// Load posts with optional category and search filters
async function loadPosts(category = '', search = '') {
  postContainer.innerHTML = '<p class="text-center text-muted">Loading...</p>';

  try {
    let url = '/search?';
    if (category) url += `category=${category}&`;
    if (search) url += `q=${search}`;

    const posts = await apiGet(url);

    if (posts.length === 0) {
      postContainer.innerHTML = '<p class="text-muted">No posts found.</p>';
      return;
    }

    postContainer.innerHTML = posts
      .map(
        (post) => `
        <div class="news-post">
          <div class="user-info">
            <a href="#" class="user-link">
              <img class="profile-pic" src="./sourceimages/user.png" alt="Profile Picture" />
            </a>
            <div class="user-details">
              <p>
                <span class="name">${post.username || 'Unknown'}</span>
                &bull; ${new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div class="post-content">
            <a href="post.html?id=${post._id}" class="post-link">
              <h4>${post.title}</h4>
            </a>
            <span class="badge bg-secondary">${post.category || 'General'}</span>
            <p>${post.content}</p>
          </div>
          <div class="vote-buttons">
            <button class="btn btn-outline-light">
              <img class="vote-icon" src="./sourceimages/up-arrow.svg" alt="Upvote" />
            </button>
            <p>${post.voteCount || 0}</p>
            <button class="btn btn-outline-light">
              <img class="vote-icon" src="./sourceimages/bottom-arrow.svg" alt="Downvote" />
            </button>
            <p>${post.commentCount || 0} comments</p>
          </div>
        </div>
      `,
      )
      .join('');
  } catch (err) {
    postContainer.innerHTML = '<p class="text-danger">Failed to load posts.</p>';
  }
}

// Category button clicks
categoryButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    categoryButtons.forEach((b) => b.classList.remove('active'));

    if (activeCategory === btn.dataset.category) {
      // Click same category again — clear filter
      activeCategory = '';
    } else {
      btn.classList.add('active');
      activeCategory = btn.dataset.category;
    }

    loadPosts(activeCategory, searchBar.value.trim());
  });
});

// Search form submit
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  loadPosts(activeCategory, searchBar.value.trim());
});

// Load all posts on page load
loadPosts();
