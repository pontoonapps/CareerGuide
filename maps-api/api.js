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

app.get('/login', promiseWrap(getUserRole));
app.get('/training-centre/users', promiseWrap(getTrainingCentreUsers));
app.post('/training-centre/users', express.json(), promiseWrap(updateTrainingCentreUsers));

app.get('/user/training-centres', promiseWrap(getUserTrainingCentres));
app.post('/user/training-centres/remove', express.json(), promiseWrap(removeUserFromTrainingCentre));

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
  const userRole = await db.findUserRole(user, pwd);
  if (userRole != null) {
    authObj.id = userRole.id;
    authObj.role = userRole.role;
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

  switch (req.auth.role) {
    case 'user':
      await db.addUpdateUserPin(req.auth.id, pin);
      break;
    case 'recruiter':
      await db.addUpdateTrainingCentrePin(req.auth.id, pin);
      break;
    default:
      res.status(403).send('unrecognized user role');
      return;
  }

  res.sendStatus(204);
}

async function deletePin(req, res, next) {
  if (!checks.stringRequired(req.body.name)) {
    res.sendStatus(400);
    return;
  }

  switch (req.auth.role) {
    case 'user':
      await db.deleteUserPin(req.auth.id, req.body.name);
      break;
    case 'recruiter':
      await db.deleteTrainingCentrePin(req.auth.id, req.body.name);
      break;
    default:
      res.status(403).send('unrecognized user role');
      return;
  }
  res.sendStatus(204);
}

async function getUserPins(req, res, next) {
  switch (req.auth.role) {
    case 'user':
      res.json(await db.listUserPins(req.auth.id));
      break;
    case 'recruiter':
      res.json(await db.listTrainingCentrePins(req.auth.id));
      break;
    default:
      res.status(403).send('unrecognized user role');
  }
}

async function getUserRole(req, res, next) {
  const retval = { role: req.auth.role };

  if (retval.role === 'user') {
    const tc = await db.findUserTrainingCentres(req.auth.id);
    retval.training_centres = tc;
  }

  res.json(retval);
}

async function getTrainingCentreUsers(req, res, next) {
  if (req.auth.role !== 'recruiter') {
    res.sendStatus(403);
    return;
  }

  res.json(await db.listTrainingCentreUsers(req.auth.id));
}

async function updateTrainingCentreUsers(req, res, next) {
  if (req.auth.role !== 'recruiter') {
    res.sendStatus(403);
    return;
  }

  const { add, remove } = req.body;

  let validationProblems = '';
  if (!checks.arrayOptional(add, checks.stringRequired)) {
    validationProblems += 'ArrayOptional(body.add, all members String)';
  }
  if (!checks.arrayOptional(remove, checks.stringRequired)) {
    validationProblems += 'ArrayOptional(body.remove, all members String)';
  }

  if (validationProblems) {
    res.status(400).send(validationProblems);
    return;
  }

  await db.updateTrainingCentreUsers(req.auth.id, add, remove);
  return getTrainingCentreUsers(req, res, next);
}

async function getUserTrainingCentres(req, res, next) {
  if (req.auth.role !== 'user') {
    res.sendStatus(403);
    return;
  }

  const tc = await db.findUserTrainingCentres(req.auth.id);

  res.json(tc);
}

async function removeUserFromTrainingCentre(req, res, next) {
  if (req.auth.role !== 'user') {
    res.sendStatus(403);
    return;
  }

  const tcEmail = req.body.email;
  if (!checks.stringRequired(tcEmail)) {
    res.sendStatus(400);
    return;
  }

  await db.removeUserFromTrainingCentre(req.auth.id, tcEmail);

  res.sendStatus(204);
}
