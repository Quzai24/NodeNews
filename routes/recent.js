import { Router } from 'express';
import { getDB } from '../db/connection.js';

const router = Router();

// GET /api/recent?period=today|week|month
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const { period = 'today', limit = '20', page = '1' } = req.query;

    // Calculate the start date based on period
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

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Fetch recent posts sorted by creation date
    const posts = await db
      .collection('posts')
      .aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limitNum },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'author',
          },
        },
        { $unwind: '$author' },
        {
          $project: {
            _id: 1,
            title: 1,
            content: 1,
            articleUrl: 1,
            category: 1,
            voteCount: 1,
            commentCount: 1,
            trendingScore: 1,
            createdAt: 1,
            'author.username': 1,
            'author.firstName': 1,
            'author.lastName': 1,
          },
        },
      ])
      .toArray();

    // Get total count for pagination
    const total = await db.collection('posts').countDocuments({ createdAt: { $gte: startDate } });

    res.json({
      posts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error('Error fetching recent posts:', err);
    res.status(500).json({ error: 'Failed to fetch recent posts.' });
  }
});

export default router;
