const { validationResult } = require('express-validator');

const Post = require('../models/post');
const { forwardError } = require('./utils');

exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: Date.now(),
        title: 'First Post',
        content: 'This is the first post!',
        imageUrl: 'images/book.png',
        creator: {
          name: 'Gaëtan'
        },
        createdAt: new Date()
      }
    ]
  });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed: Entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;
  const post = new Post({
    title,
    content,
    imageUrl: 'images/book.png',
    creator: {
      name: 'Gaëtan'
    }
  });

  post.save()
    .then(result => {
      res.status(201).json({
        message: 'Post created successfully',
        post: result
      });
    }).catch(err => forwardError(err, next));
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post with id = ' + postId);
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'Post successfully fetched', post });
    }).catch(err => forwardError(err, next));
};
