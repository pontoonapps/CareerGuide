const express = require('express');

const basicAuth = require('./lib/express-basic-auth');
const db = require('./db');
const config = require('./config');

const app = express.Router({
  caseSensitive: true,
  strict: true,
});
module.exports = app;

const auth = basicAuth({
  authorizer: checkDBUser,
});

app.get('/', msg('hi, testing'));

app.use(checkApiKey);
app.get('/ping', msg('hi, api key working'));

app.use(auth);
app.get('/testcount', promiseWrap(testCount));

app.post('/pins', express.json(), promiseWrap(addPin));
app.post('/pins/delete', express.json(), promiseWrap(deletePin));
app.get('/pins', promiseWrap(getUserPins));

// server functions

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
  const userFound = await db.findUser(user, pwd);
  if (userFound != null) {
    authObj.id = userFound;
    return true;
  } else {
    return false;
  }
}

async function testCount(req, res, next) {
  const count = await db.testCount();
  res.send(`hi, there are ${count} users as of ${new Date()}\n`);
}

async function addPin(req, res, next) {
  res.sendStatus(501);
}

async function deletePin(req, res, next) {
  res.sendStatus(501);
}

async function getUserPins(req, res, next) {
  res.sendStatus(501);
}