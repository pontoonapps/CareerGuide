const express = require('express');
const basicAuth = require('../lib/express-basic-auth');

const config = require('../config');
const db = require('../db').common;

// create an express router that is common for API versions
function setupAppWithCommonRoutesAndAuth() {
  const app = express.Router({
    caseSensitive: true,
    strict: true,
  });

  app.get('/', msg('working'));

  app.use(checkApiKey);
  app.get('/ping', msg('api key accepted'));

  const auth = basicAuth({
    authorizer: checkDBUser,
  });

  app.use(auth);

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

async function checkDBUser(user, pwd, authObj) {
  const userRole = await db.findUserRole(user, pwd);
  if (userRole != null) {
    authObj.id = userRole.id;
    authObj.role = userRole.role;
    return true;
  } else {
    return false;
  }
}


module.exports = {
  promiseWrap,
  setupAppWithCommonRoutesAndAuth,
};
