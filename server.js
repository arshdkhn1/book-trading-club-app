const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const compression = require('compression');
const logger = require('morgan');

const app = express();

app.use(logger('dev'));

if (process.env.NODE_ENV !== "production") {
  require('dotenv').load();
  const webpackMiddleware = require("webpack-dev-middleware");
  const webpack = require('webpack');

  const config = require('./webpack/webpack.config');

  app.use(webpackMiddleware(webpack(config), {
    // overriding public path for index.ejs
    publicPath: "/dist",
    headers: { "X-Custom-Webpack-Header": "yes" },
    stats: {
      color: true
    }
  }));
}

require('./config/passport')(passport);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression()); // for gzipping

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

const options = {
  server: {
    socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 }
  },
  replset: {
    socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 }
  }
};

mongoose.connect(process.env.MONGO_URI, options, err => {
  if (err) {
    console.log(`Some error happened while connecting to db - ${err}`);
  } else {
    console.log(`db connected successfully!`);
  }
});

mongoose.Promise = global.Promise;
const conn = mongoose.connection;

conn.on('error', console.error.bind(console, 'connection error:'));

conn.once('open', () => {
  // Routes
});

const port = process.env.PORT || 8080;
app.listen(port, function () {
  console.log(`Node.js listening on port ${port} in ${process.env.NODE_ENV} environment!`);
});