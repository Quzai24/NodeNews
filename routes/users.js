import { Router } from 'express';
import { getDB } from '../db/connection.js';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import 'dotenv/config.js';

const router = Router();

// GET user by username
router.get('/:username', async (req, res) => {
  try {
    const db = getDB();
    const user = await db.collection('users').findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

// GET user by ID
router.get('/:userId', async (req, res) => {
  try {
    const db = getDB();
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.params.userId) });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

// User registration
router.post('/register', async (req, res) => {
  try {
    const db = getDB();
    const { username, password, repassword } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username, password are required.' });
    }
    if (password !== repassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }
    const existingUser = await db.collection('users').findOne({ username: username.trim() });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      username: username.trim(),
      password: hashedPassword,
      postCount: 0,
      createdAt: new Date(),
    };
    const result = await db.collection('users').insertOne(newUser);
    res.status(201).json({ ...newUser, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register user.' });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const db = getDB();
    const { username, password } = req.body;
    const user = await db.collection('users').findOne({ username: username.trim() });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid password.' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '10m' });
    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET);
    await db.collection('users').updateOne({ _id: user._id }, { $set: { refreshToken } });
    res.json({ token, refreshToken, user: { _id: user._id, username: user.username } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to login user.' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const db = getDB();
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required.' });
    }
    const user = await db.collection('users').findOne({ refreshToken });
    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token.' });
    }
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err || decoded.userId.toString() !== user._id.toString()) {
        return res.status(401).json({ error: 'Invalid refresh token.' });
      }
      const newToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '10m' });
      res.json({ token: newToken });
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to refresh token.' });
  }
});

router.delete('/logout', async (req, res) => {
  try {
    const db = getDB();
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required.' });
    }
    const user = await db.collection('users').findOne({ refreshToken });
    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token.' });
    }
    await db.collection('users').updateOne({ _id: user._id }, { $unset: { refreshToken: '' } });
    res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to logout user.' });
  }
});

export default router;
