const express = require('express');

const config = require('../config');

const authBasic = require('./auth/basic');
const authCookie = require('./auth/cookie');

// create an express router that is common for API versions
function setupAppWithCommonRoutesAndAuth() {
  const app = express.Router({
    caseSensitive: true,
    strict: true,
  });

  app.get('/', msg('working'));

  app.use(checkApiKey);
  app.get('/ping', msg('api key accepted'));

  app.use(authBasic());
  app.use(authCookie());

  return app;
}

function msg(...message) {
  message = message.join('\n');
  return (req, res) => {
    res.type('text/plain');
    res.send(`${message}\n${new Date()}\n`);
  };
}

function promiseWrap(f) {
  return (req, res, next) => {
    Promise.resolve(f(req, res, next))
      .catch((e) => next(e || new Error()));
  };
}

function checkApiKey(req, res, next) {
  if (req.query.apiKey in config.RECOGNISED_API_KEYS) {
    next();
  } else {
    res.sendStatus(403);
  }
}

module.exports = {
  promiseWrap,
  setupAppWithCommonRoutesAndAuth,
};
