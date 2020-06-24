const fs = require('fs');
const path = require('path');

const io = require('../socket');

const Post = require('../models/post');
const User = require('../models/user');
const { forwardError, validate } = require('./utils');

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => {
    if (err) {
      console.log(err);
    }
  });
};

exports.getPosts = async (req, res, next) => {
  const currentPage = +req.query.page || 1;
  const pageSize = +req.query.pagesize || 2;

  try {
    // Count the number of posts
    const totalItems = await Post.countDocuments();
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
  validate(req, next);

  if (!req.file) {
    return forwardError('No image provided.', next, 422);
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

    // Emit the newly created post to all connected clients
    io.getIO().emit('posts', { action: 'create', post });

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
    if (!post) {
      return forwardError(
        'Could not find post with id = ' + postId + '.',
        next,
        404
      );
    }
    res.status(200).json({ message: 'Post fetched successfully ', post });
  } catch (err) {
    forwardError(err, next);
  }
};

exports.updatePost = async (req, res, next) => {
  validate(req, next);

  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  let newFile = false;

  // In case a new file was picked
  if (req.file) {
    imageUrl = req.file.path.replace('\\', '/');
    newFile = true;
  }
  if (!imageUrl) {
    return forwardError('No image picked.', next, 422);
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return forwardError(
        'Could not find post with id = ' + postId + '.',
        next,
        404
      );
    }

    // check if the user is allowed to update the post
    if (post.creator.toString() !== req.userId) {
      return forwardError('Not Authorized.', next, 403);
    }

    // Delete the old image if it has changed
    if (!imageUrl.includes(post.imageUrl)) {
      clearImage(post.imageUrl);
    }

    post.title = title;
    post.content = content;
    post.imageUrl = newFile ? imageUrl : post.imageUrl;
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
    if (!post) {
      return forwardError(
        'Could not find post with id = ' + postId + '.',
        next,
        404
      );
    }

    // Check if the user is allowed to delete the post
    if (post.creator.toString() !== req.userId) {
      return forwardError('Not Authorized.', next, 403);
    }

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
