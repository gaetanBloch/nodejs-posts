const express = require('express');
const { body } = require('express-validator');

const feedController = require('../controllers/feed');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

const postValidation = () => {
  return [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 })
  ];
};

// GET /feed/posts
router.get('/posts', feedController.getPosts);

// POST /feed/posts
router.post('/posts', postValidation(), feedController.createPost);

// GET /feed/posts/id
router.get('/posts/:postId', feedController.getPost);

// PUT /feed/posts/id
router.put('/posts/:postId', isAuth, postValidation(), feedController.updatePost);

// DELETE /feed/posts/id
router.delete('/posts/:postId', isAuth, feedController.deletePost);

module.exports = router;
