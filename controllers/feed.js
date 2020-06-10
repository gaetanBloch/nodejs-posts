const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

const Post = require('../models/post');
const { forwardError, throwError } = require('./utils');

const validatePost = req => {
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

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
};

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;

  // Count the number of posts
  let totalItems;
  Post.find()
    .countDocuments()
    .then(count => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
    })
    .then(posts => {
      res.status(200).json({
        message: 'Posts fetched successfully',
        posts,
        totalItems
      });
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
      // Delete the old image if it has changed
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
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

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      checkPost(post, postId);
      // Delete the old image
      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then(() => {
      res.status(200).json({
        message: 'Post deleted successfully.'
      });
    })
    .catch(err => forwardError(err, next));
};
