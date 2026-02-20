const postContainer = document.getElementById('post-container');
const categoryButtons = document.querySelectorAll('.category-btn');
const searchBar = document.querySelector('.search-bar');
const searchForm = document.querySelector('.search-container form');

let activeCategory = '';

function showError(msg) {
  postContainer.innerHTML = `<div class="alert alert-danger">${msg}</div>`;
}

function renderPosts(posts) {
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
                <p class="article-title">${post.articleUrl}</p>
              </a>
            </div>
          </div>
        `
            : ''
        }
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
}

// Load posts — uses search API if filtering, otherwise loads all posts
async function loadPosts() {
  postContainer.innerHTML = '<p class="text-center text-muted">Loading...</p>';

  const search = searchBar ? searchBar.value.trim() : '';

  try {
    let res;

    if (activeCategory || search) {
      let url = '/api/search?';
      if (activeCategory) url += `category=${activeCategory}&`;
      if (search) url += `q=${search}`;
      res = await fetch(url);
    } else {
      res = await fetch('/api/posts');
    }

    if (!res.ok) {
      showError(`Failed to fetch posts: ${res.status} ${res.statusText}`);
      return;
    }

    const posts = await res.json();
    renderPosts(posts);
  } catch (err) {
    showError('Failed to load posts.');
  }
}

// Category button clicks
if (categoryButtons) {
  categoryButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      categoryButtons.forEach((b) => b.classList.remove('active'));

      if (activeCategory === btn.dataset.category) {
        activeCategory = '';
      } else {
        btn.classList.add('active');
        activeCategory = btn.dataset.category;
      }

      loadPosts();
    });
  });
}

// Search form submit
if (searchForm) {
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loadPosts();
  });
}

// Load all posts on page load
loadPosts();

export { showError, renderPosts };
