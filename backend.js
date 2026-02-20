import express from 'express';
import 'dotenv/config';
import { connectDB } from './db/connection.js';
import postsRouter from './routes/posts.js';
import commentsRouter from './routes/comments.js';
import votesRouter from './routes/votes.js';
import trendingRouter from './routes/trending.js';
import recentRouter from './routes/recent.js';
import searchRouter from './routes/search.js';
import usersRouter from './routes/users.js';

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());

// Serve login.html on root path
app.get('/', (req, res) => {        
  res.sendFile('login.html', { root: 'frontend' });
});

app.use(express.static('frontend'));

app.use('/api/posts', postsRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/votes', votesRouter);
app.use('/api/trending', trendingRouter);
app.use('/api/recent', recentRouter);
app.use('/api/search', searchRouter);
app.use('/api/users', usersRouter);
app.use('/LICENSE', express.static('LICENSE'));

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
