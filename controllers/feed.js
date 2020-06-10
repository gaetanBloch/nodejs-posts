const { validationResult } = require('express-validator');

const Post = require('../models/post');
const { forwardError, throwError } = require('./utils');

const validatePost = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throwError('Validation failed: Entered data is incorrect.', 422);
  }
};

const checkPost = (post, postId) => {
  if (!post) {
    throwError('Could not find post with id = ' + postId + '.', 404);
  }
};

exports.getPosts = (req, res, next) => {
  Post.find()
    .then(posts => {
      res.status(200).json({ message: 'Posts fetched successfully', posts });
    })
    .catch(err => forwardError(err, next));
};

exports.createPost = (req, res, next) => {
  validatePost(req);

  if (!req.file) {
    throwError('No image provided.', 422);
  }

  const imageUrl = req.file.path.replace('\\', '/');
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
      checkPost(post, postId);
      res.status(200).json({ message: 'Post fetched successfully ', post });
    }).catch(err => forwardError(err, next));
};

exports.updatePost = (req, res, next) => {
  validatePost(req);

  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  // In case a new file was picked
  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    throwError('No image picked.', 422);
  }

  Post.findById(postId)
    .then(post => {
      checkPost(post, postId);
      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then(result => {
      res.status(200).json({
        message: 'Post updated successfully.',
        post: result
      });
    })
    .catch(err => forwardError(err, next));
};
