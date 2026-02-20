import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db/connection.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// GET a post
router.get("/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    if (!ObjectId.isValid(postId)) {
      return res.status(400).json({ error: 'Invalid post id.' });
    }

    const db = getDB();
    const post = await db.collection('posts').findOne({ _id: new ObjectId(postId) });
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch post.' });
  }
});



// CREATE a post (requires login)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const db = getDB();
    const { title, content, articleUrl, category } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ error: "Title and content are required." });
    }

    const newPost = {
      title: title.trim(),
      content: content.trim(),
      articleUrl: articleUrl || null,
      category: category || "General",
      userId: new ObjectId(req.user.userId),
      username: req.user.username,
      content: content.trim(),
      createdAt: new Date(),
    };

    const result = await db.collection("posts").insertOne(newPost);

    // Increment postCount on the user
    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(req.user.userId) }, { $inc: { postCount: 1 } });

    res.status(201).json({ ...newPost, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: "Failed to create post." });
  }
});


// UPDATE a post (only by author)
router.put("/:postId", authenticateToken, async (req, res) => {
  try {
    const db = getDB();
    const { title, content, articleUrl, category } = req.body;

    const post = await db
      .collection("posts")
      .findOne({ _id: new ObjectId(req.params.postId) });

    if (!post) return res.status(404).json({ error: "Post not found." });
    if (post.userId.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ error: "You can only edit your own posts." });
    }

    await db
      .collection("posts")
      .updateOne(
        { _id: new ObjectId(req.params.postId) },
        { $set: { title: title.trim(), content: content.trim(), articleUrl, category } },
      );

    res.json({ message: "Post updated." });
  } catch (err) {
    res.status(500).json({ error: "Failed to update post." });
  }
});

// DELETE a post (only by author)
router.delete("/:postId", authenticateToken, async (req, res) => {
  try {
    const db = getDB();

    const post = await db
      .collection("posts")
      .findOne({ _id: new ObjectId(req.params.postId) });

    if (!post) return res.status(404).json({ error: "Post not found." });
    if (post.userId.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ error: "You can only delete your own posts." });
    }

    await db
      .collection("posts")
      .deleteOne({ _id: new ObjectId(req.params.postId) });

    // Decrement commentCount on the post
    await db
      .collection("posts")
      .updateOne({ _id: post._id }, { $inc: { commentCount: -1 } });

    res.json({ message: "Post deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete post." });
  }
});

export default router;
