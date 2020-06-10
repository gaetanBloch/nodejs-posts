const { validationResult } = require('express-validator');

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
    return res.status(422).json({
      message: 'Validation failed: Entered data is incorrect.',
      errors: errors.array()
    });
  }

  const title = req.body.title;
  const content = req.body.content;

  // TODO create post in DB

  res.status(201).json({
    message: 'Post created successfully',
    post: {
      _id: Date.now(),
      title,
      content,
      creator: {
        name: 'Gaëtan'
      },
      createdAt: new Date()
    }
  });
};
