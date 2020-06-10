const { validationResult } = require('express-validator');

const Post = require('../models/post');
const { forwardError, throwError } = require('./utils');

exports.getPosts = (req, res, next) => {
  Post.find()
    .then(posts => {
      res.status(200).json({ message: 'Posts fetched successfully', posts });
    })
    .catch(err => forwardError(err, next));
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throwError('Validation failed: Entered data is incorrect.', 422);
  }

  if (!req.file) {
    throwError('No image provided.', 422);
  }

  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;
  const post = new Post({
    title,
    content,
    imageUrl,
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
        throwError('Could not find post with id = ' + postId + '.', 404);
      }
      res.status(200).json({ message: 'Post fetched successfully ', post });
    }).catch(err => forwardError(err, next));
};
