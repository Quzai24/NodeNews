import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET all comments for a post
router.get('/post/:postId', async (req, res) => {
  try {
    const db = getDB();
    const comments = await db
      .collection('comments')
      .find({ postId: new ObjectId(req.params.postId) })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments.' });
  }
});

// CREATE a comment (requires login)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const db = getDB();
    const { username, postId, content } = req.body;

    if (!postId || !content) {
      return res.status(400).json({ error: 'postId and content are required.' });
    }

    const newComment = {
      postId: new ObjectId(postId),
      userId: new ObjectId(req.user.userId),
      username: username,
      content: content.trim(),
      createdAt: new Date(),
    };

    const result = await db.collection('comments').insertOne(newComment);

    // Increment commentCount on the post
    await db
      .collection('posts')
      .updateOne({ _id: new ObjectId(postId) }, { $inc: { commentCount: 1 } });

    res.status(201).json({ ...newComment, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create comment.' });
  }
});

// UPDATE a comment (only by author)
router.put('/:commentId', authenticateToken, async (req, res) => {
  try {
    const db = getDB();
    const { content } = req.body;

    const comment = await db
      .collection('comments')
      .findOne({ _id: new ObjectId(req.params.commentId) });

    if (!comment) return res.status(404).json({ error: 'Comment not found.' });
    if (comment.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'You can only edit your own comments.' });
    }

    await db
      .collection('comments')
      .updateOne(
        { _id: new ObjectId(req.params.commentId) },
        { $set: { content: content.trim() } },
      );

    res.json({ message: 'Comment updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update comment.' });
  }
});

// DELETE a comment (only by author)
router.delete('/:commentId', authenticateToken, async (req, res) => {
  try {
    const db = getDB();

    const comment = await db
      .collection('comments')
      .findOne({ _id: new ObjectId(req.params.commentId) });

    if (!comment) return res.status(404).json({ error: 'Comment not found.' });
    if (comment.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'You can only delete your own comments.' });
    }

    await db.collection('comments').deleteOne({ _id: new ObjectId(req.params.commentId) });

    // Decrement commentCount on the post
    await db.collection('posts').updateOne({ _id: comment.postId }, { $inc: { commentCount: -1 } });

    res.json({ message: 'Comment deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete comment.' });
  }
});

export default router;
