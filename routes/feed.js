const express = require('express');
const { body } = require('express-validator');

const feedController = require('../controllers/feed');

const router = express.Router();

// GET /feed/posts
router.get('/posts', feedController.getPosts);

// POST /feed/posts
router.post(
  '/posts',
  [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 })
  ],
  feedController.createPost
);

// GET /feed/posts/id
router.get('/posts/:postId', feedController.getPost);

// PUT /feed/posts/id
router.put(
  '/posts/:postId',
  [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 })
  ],
  feedController.updatePost
);

module.exports = router;
