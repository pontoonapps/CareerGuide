const express = require('express');

const basicAuth = require('./lib/express-basic-auth');
const checks = require('./checks');
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

async function addPin(req, res, next) {
  const pin = req.body;

  /* eslint-disable no-multi-spaces, space-in-parens */
  let validationProblems = '';
  if (!checks.stringRequired(pin.name,            40)) validationProblems += 'StringRequired(pin.name, max 40 chars) ';
  if (!checks.numberRequired(pin.latitude           )) validationProblems += 'NumberRequired(pin.latitude) ';
  if (!checks.numberRequired(pin.longitude          )) validationProblems += 'NumberRequired(pin.longitude) ';
  if (!checks.numberOptional(pin.category           )) validationProblems += 'NumberOptional(pin.category) ';
  if (!checks.stringOptional(pin.description,    255)) validationProblems += 'StringOptional(pin.description, max 255 chars) ';
  if (!checks.stringOptional(pin.phone,           25)) validationProblems += 'StringOptional(pin.phone, max 25 chars) ';
  if (!checks.stringOptional(pin.website,        255)) validationProblems += 'StringOptional(pin.website, max 255 chars) ';
  if (!checks.stringOptional(pin.email,          255)) validationProblems += 'StringOptional(pin.email, max 255 chars) ';
  if (!checks.stringOptional(pin.address_line_1, 255)) validationProblems += 'StringOptional(pin.address_line_1, max 255 chars) ';
  if (!checks.stringOptional(pin.address_line_2, 255)) validationProblems += 'StringOptional(pin.address_line_2, max 255 chars) ';
  if (!checks.stringOptional(pin.postcode,        12)) validationProblems += 'StringOptional(pin.postcode, max 12 chars) ';
  if (!checks.stringOptional(pin.notes,          255)) validationProblems += 'StringOptional(pin.notes, max 255 chars) ';
  /* eslint-enable no-multi-spaces, space-in-parens */

  if (validationProblems) {
    res.status(400).send(validationProblems);
    return;
  }

  await db.addUpdateUserPin(req.auth.id, pin);
  res.sendStatus(204);
}

async function deletePin(req, res, next) {
  if (!checks.stringRequired(req.body.name)) {
    res.sendStatus(400);
    return;
  }

  await db.deleteUserPin(req.auth.id, req.body.name);
  res.sendStatus(204);
}

async function getUserPins(req, res, next) {
  res.json(await db.listUserPins(req.auth.id));
}
