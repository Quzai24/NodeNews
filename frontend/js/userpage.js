//get a user posts onto the html page
import { renderPosts, showError } from './frontend.js';

async function loadUserPosts() {
    const username = document.getElementById('username').textContent.trim();
    try {
        const res = await fetch(`/api/posts/user/${username}`);
        if (!res.ok) {
            showError(`Failed to fetch user posts: ${res.status} ${res.statusText}`);
            return;
        }
        const posts = await res.json();
        renderPosts(posts);
    } catch (err) {
        showError('Failed to load user posts.');
    }
}

loadUserPosts();