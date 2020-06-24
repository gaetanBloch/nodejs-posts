const app = require('./app');
const debug = require('debug')('nodejs-posts');
const http = require('http');
const mongoose = require('mongoose');

const MONGODB_URI = `mongodb+srv://gbloch:${process.env.MONGO_ATLAS_PWD}@cluster0-hcscb.mongodb.net/posts?retryWrites=true&w=majority`;

const normalizePort = val => {
  let port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
};

const onError = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const bind = typeof port === 'string' ? 'pipe ' + port : 'port ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const onListening = () => {
  const bind = typeof port === 'string' ? 'pipe ' + port : 'port ' + port;
  debug('Listening on ' + bind);
};

const port = normalizePort(process.env.PORT || '8080');
app.set('port', port);

const server = http.createServer(app);
server.on('error', onError);
server.on('listening', onListening);

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Successfully connected to MongoDb.');
    const port = process.env.PORT || 8080;
    server.listen(port, () => {
      console.log(`Listening to port ${port}...`);
    });
    const io = require('socket.io')(server);
    io.on('connection', socket => {
      console.log('Client connected');
    });
  })
  .catch((err) => console.log(err));
