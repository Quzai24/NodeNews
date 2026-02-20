import { MongoClient } from 'mongodb';
import { readFile } from 'fs/promises';
import 'dotenv/config';

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

const categories = ['Politics', 'Tech', 'Health', 'World', 'Science'];

const headlines = [
  'New policy reform sparks nationwide debate',
  'Tech giant announces breakthrough in AI research',
  'Study reveals surprising health benefits of daily walking',
  'International summit addresses climate change concerns',
  'Scientists discover potentially habitable exoplanet',
  'Stock market hits record high amid economic optimism',
  'New cybersecurity threat targets major corporations',
  'Healthcare costs continue to rise across the country',
  'Peace talks resume between rival nations',
  'Researchers develop promising new cancer treatment',
  'Government unveils new education funding plan',
  'Startup raises millions for clean energy innovation',
  'Mental health awareness campaign gains momentum',
  'Trade agreement reshapes global supply chains',
  'Space agency announces next Mars mission details',
  'Election polls show tight race in key states',
  'Social media platform faces privacy scrutiny',
  'New study links diet to cognitive performance',
  'Diplomatic crisis escalates in Middle East',
  'Quantum computing reaches new milestone',
  'Infrastructure bill passes with bipartisan support',
  'Major data breach exposes millions of records',
  'Vaccine rollout expands to new age groups',
  'UN report warns of rising sea levels',
  'Gene therapy shows promise for rare diseases',
];

const commentTexts = [
  'Great article, very informative!',
  'I disagree with this take.',
  'This is exactly what I was thinking.',
  'Can someone provide more sources on this?',
  'Interesting perspective, thanks for sharing.',
  'This needs more attention.',
  'Not sure I agree but well written.',
  'Finally someone is covering this topic.',
  'The data here is really compelling.',
  'I think this misses some key points.',
  'Well researched piece.',
  'This changed my mind on the issue.',
  'We need more journalism like this.',
  'Bookmarking this for later.',
  'The comments here are more insightful than the article.',
];

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysBack) {
  return new Date(Date.now() - Math.floor(Math.random() * daysBack * 24 * 60 * 60 * 1000));
}

async function seed() {
  try {
    await client.connect();
    const db = client.db('newsnode');

    // Clear existing data
    await db.collection('users').deleteMany({});
    await db.collection('posts').deleteMany({});
    await db.collection('comments').deleteMany({});
    await db.collection('votes').deleteMany({});
    console.log('Cleared existing data.');

    // Load Mockaroo users
    const rawData = await readFile('scripts/MOCK_DATA.json', 'utf-8');
    const mockUsers = JSON.parse(rawData);

    // Create users from Mockaroo data
    const users = mockUsers.map((u) => ({
      firstName: u.firstName,
      lastName: u.lastName,
      username: u.username,
      email: u.email,
      password: '$2b$10$dummyhashedpasswordforseeding1234567890',
      createdAt: randomDate(90),
    }));

    const userResult = await db.collection('users').insertMany(users);
    const userIds = Object.values(userResult.insertedIds);
    console.log(`Created ${userIds.length} users.`);

    // Create 500 posts
    const posts = [];
    for (let i = 0; i < 500; i++) {
      const userIdx = Math.floor(Math.random() * userIds.length);
      posts.push({
        userId: userIds[userIdx],
        username: users[userIdx].username,
        title: random(headlines),
        content: `This is a discussion about: ${random(headlines).toLowerCase()}. What are your thoughts on this topic?`,
        articleUrl: `https://example.com/article/${i}`,
        category: random(categories),
        voteCount: 0,
        commentCount: 0,
        createdAt: randomDate(30),
      });
    }
    const postResult = await db.collection('posts').insertMany(posts);
    const postIds = Object.values(postResult.insertedIds);
    console.log(`Created ${postIds.length} posts.`);

    // Create 400 comments
    const comments = [];
    for (let i = 0; i < 400; i++) {
      const userIdx = Math.floor(Math.random() * userIds.length);
      const postIdx = Math.floor(Math.random() * postIds.length);
      comments.push({
        postId: postIds[postIdx],
        userId: userIds[userIdx],
        username: users[userIdx].username,
        content: random(commentTexts),
        createdAt: randomDate(30),
      });
      posts[postIdx].commentCount = (posts[postIdx].commentCount || 0) + 1;
    }
    await db.collection('comments').insertMany(comments);
    console.log(`Created ${comments.length} comments.`);

    // Create 200 votes
    const voteSet = new Set();
    const votes = [];
    let attempts = 0;
    while (votes.length < 200 && attempts < 1000) {
      const userIdx = Math.floor(Math.random() * userIds.length);
      const postIdx = Math.floor(Math.random() * postIds.length);
      const key = `${userIds[userIdx]}-${postIds[postIdx]}`;

      if (!voteSet.has(key)) {
        voteSet.add(key);
        const value = Math.random() > 0.3;
        votes.push({
          userId: userIds[userIdx],
          postId: postIds[postIdx],
          value,
          createdAt: randomDate(30),
        });
        posts[postIdx].voteCount += value ? 1 : -1;
      }
      attempts++;
    }
    await db.collection('votes').insertMany(votes);
    console.log(`Created ${votes.length} votes.`);

    // Update posts with correct counts
    for (let i = 0; i < posts.length; i++) {
      await db
        .collection('posts')
        .updateOne(
          { _id: postIds[i] },
          { $set: { commentCount: posts[i].commentCount, voteCount: posts[i].voteCount } },
        );
    }
    console.log('Updated post counts.');

    // Create indexes
    await db.collection('votes').createIndex({ userId: 1, postId: 1 }, { unique: true });
    await db.collection('posts').createIndex({ category: 1 });
    await db.collection('posts').createIndex({ createdAt: -1 });
    await db.collection('comments').createIndex({ postId: 1 });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('Created indexes.');

    const total = userIds.length + postIds.length + comments.length + votes.length;
    console.log(`\nDone! Total records: ${total}`);
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await client.close();
  }
}

seed();
