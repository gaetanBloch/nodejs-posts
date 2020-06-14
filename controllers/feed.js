const fs = require('fs');
const path = require('path');

const Post = require('../models/post');
const User = require('../models/user');
const { forwardError, throwError, validate } = require('./utils');

const checkPost = (post, postId) => {
  if (!post) {
    throwError('Could not find post with id = ' + postId + '.', 404);
  }
};

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
};

const checkAuthorization = (post, req) => {
  if (post.creator.toString() !== req.userId) {
    throwError('Not Authorized.', 403);
  }
};

exports.getPosts = async (req, res, next) => {
  const currentPage = +req.query.page || 1;
  const pageSize = +req.query.pagesize || 2;

  try {
    // Count the number of posts
    const totalItems = await Post.count();
    const posts = await Post.find()
      .populate('creator')
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize);
    res.status(200).json({
      message: 'Posts fetched successfully',
      posts,
      totalItems
    });
  } catch (err) {
    forwardError(err, next);
  }
};

exports.createPost = async (req, res, next) => {
  validate(req);

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
    creator: req.userId
  });

  try {
    const createdPost = await post.save();
    const creator = await User.findById(req.userId);
    creator.posts.push(post);
    await creator.save();
    res.status(201).json({
      message: 'Post created successfully',
      post: createdPost,
      creator: { _id: creator._id, name: creator.name }
    });
  } catch (err) {
    forwardError(err, next);
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    checkPost(post, postId);
    res.status(200).json({ message: 'Post fetched successfully ', post });
  } catch (err) {
    forwardError(err, next);
  }
};

exports.updatePost = async (req, res, next) => {
  validate(req);

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

  try {
    const post = await Post.findById(postId);
    checkPost(post, postId);

    // check if the user is allowed to update the post
    checkAuthorization(post, req);

    // Delete the old image if it has changed
    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }

    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;
    const result = await post.save();
    res.status(200).json({
      message: 'Post updated successfully.',
      post: result
    });
  } catch (err) {
    forwardError(err, next);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    checkPost(post, postId);

    // Check if the user is allowed to delete the post
    checkAuthorization(post, req);

    // Delete the old image
    clearImage(post.imageUrl);

    await Post.findByIdAndRemove(postId);
    const user = await User.findById(req.userId);

    // Delete the post within the user
    user.posts.pull(postId);
    await user.save();

    res.status(200).json({
      message: 'Post deleted successfully.'
    });
  } catch (err) {
    forwardError(err, next);
  }
};
