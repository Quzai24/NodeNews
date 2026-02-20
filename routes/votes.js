import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// POST a vote (upvote or downvote)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const db = getDB();
    const { postId, value } = req.body;

    if (!postId || value === undefined) {
      return res.status(400).json({ error: 'postId and value are required.' });
    }

    if (!ObjectId.isValid(postId)) {
      return res.status(400).json({ error: 'Invalid post id.' });
    }

    const userId = req.user.userId;
    const votesCollection = db.collection('votes');

    // Check if user already voted on this post
    const existingVote = await votesCollection.findOne({
      postId: new ObjectId(postId),
      userId: new ObjectId(userId),
    });

    const voteChange = value ? 1 : -1;
    let newVoteCount = voteChange;

    if (existingVote) {
      // If user is changing their vote
      if (existingVote.value !== value) {
        newVoteCount = value ? 2 : -2; // +1 and -1 from old vote, or -1 and +1
        await votesCollection.updateOne(
          { _id: existingVote._id },
          { $set: { value } }
        );
      } else {
        // User is removing their vote
        newVoteCount = value ? -1 : 1;
        await votesCollection.deleteOne({ _id: existingVote._id });
      }
    } else {
      // New vote
      await votesCollection.insertOne({
        postId: new ObjectId(postId),
        userId: new ObjectId(userId),
        value,
        createdAt: new Date(),
      });
    }

    // Update post voteCount
    await db
      .collection('posts')
      .updateOne(
        { _id: new ObjectId(postId) },
        { $inc: { voteCount: newVoteCount } }
      );

    res.json({
      message: 'Vote recorded.',
      voteCount: newVoteCount,
    });
  } catch (err) {
    console.error('Vote error:', err);
    res.status(500).json({ error: 'Failed to record vote.' });
  }
});

// GET /api/votes/trending?period=today|week|month
router.get('/trending', async (req, res) => {
  try {
    const db = getDB();
    const { period = 'today' } = req.query;

    // Calculate start date
    const now = new Date();
    let startDate;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return res
          .status(400)
          .json({ error: 'Invalid period. Use today, week, or month.' });
    }

    // Get top 20 posts sorted by voteCount
    const posts = await db
      .collection('posts')
      .find({ createdAt: { $gte: startDate } })
      .sort({ voteCount: -1, createdAt: -1 })
      .limit(20)
      .toArray();

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trending posts.' });
  }
});

// GET /api/trending?period=today|week|month
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const { period = 'today' } = req.query;

    // Calculate start date
    const now = new Date();
    let startDate;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return res.status(400).json({ error: 'Invalid period. Use today, week, or month.' });
    }

    // Get top 20 posts sorted by voteCount
    const posts = await db
      .collection('posts')
      .find({ createdAt: { $gte: startDate } })
      .sort({ voteCount: -1, createdAt: -1 })
      .limit(20)
      .toArray();

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trending posts.' });
  }
});

export default router;
