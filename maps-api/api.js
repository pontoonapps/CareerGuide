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

app.get('/', msg('working'));

app.use(checkApiKey);
app.get('/ping', msg('api key accepted'));

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
  const pin = req.body;
  const validationProblems = '' +
    (checkStringRequired(pin.name, 40) ? '' : 'StringRequired(pin.name, max 40 chars) ') +
    (checkNumberRequired(pin.latitude) ? '' : 'NumberRequired(pin.latitude) ') +
    (checkNumberRequired(pin.longitude) ? '' : 'NumberRequired(pin.longitude) ') +
    (checkNumberOptional(pin.category) ? '' : 'NumberOptional(pin.category) ') +
    (checkStringOptional(pin.description, 255) ? '' : 'StringOptional(pin.description, max 255 chars) ') +
    (checkStringOptional(pin.phone, 25) ? '' : 'StringOptional(pin.phone, max 25 chars) ') +
    (checkStringOptional(pin.website, 255) ? '' : 'StringOptional(pin.website, max 255 chars) ') +
    (checkStringOptional(pin.email, 255) ? '' : 'StringOptional(pin.email, max 255 chars) ') +
    (checkStringOptional(pin.address_line_1, 255) ? '' : 'StringOptional(pin.address_line_1, max 255 chars) ') +
    (checkStringOptional(pin.address_line_2, 255) ? '' : 'StringOptional(pin.address_line_2, max 255 chars) ') +
    (checkStringOptional(pin.postcode, 12) ? '' : 'StringOptional(pin.postcode, max 12 chars) ') +
    (checkStringOptional(pin.notes, 255) ? '' : 'StringOptional(pin.notes, max 255 chars) ');
  if (validationProblems) {
    res.status(400).send(validationProblems);
    return;
  }

  res.sendStatus(501);
}

function checkStringOptional(value, maxLen = 0) {
  if (value == null) return true;
  if (typeof value !== 'string') return false;
  if (maxLen && value.length > maxLen) return false;
  return true;
}

function checkStringRequired(value, maxLen = 0) {
  if (value == null) return false;
  if (typeof value !== 'string') return false;
  if (value.length === 0) return false;
  if (maxLen && value.length > maxLen) return false;
  return true;
}

function checkNumberOptional(value) {
  return value == null || typeof value === 'number';
}

function checkNumberRequired(value) {
  return typeof value === 'number';
}

async function deletePin(req, res, next) {
  if (!checkStringRequired(req.body.name)) {
    res.sendStatus(400);
    return;
  }

  await db.deleteUserPin(req.auth.id, req.body.name);
  res.sendStatus(204);
}

async function getUserPins(req, res, next) {
  res.json(await db.listUserPins(req.auth.id));
}
