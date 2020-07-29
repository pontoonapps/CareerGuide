const express = require('express');

const checks = require('./checks');
const common = require('./common');
const db = require('../db').v1v2;

const promiseWrap = common.promiseWrap;

function setupV1AndV2CommonRoutes(app) {
  app.get('/pins', promiseWrap(getUserPins));

  app.get('/login', promiseWrap(getUserRole));

  app.get('/training-centre/users', promiseWrap(getTrainingCentreUsers));
  app.post('/training-centre/users', express.json(), promiseWrap(updateTrainingCentreUsers));

  app.get('/user/training-centres', promiseWrap(getUserTrainingCentres));
  app.post('/user/training-centres/remove', express.json(), promiseWrap(removeUserFromTrainingCentre));
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

module.exports = {
  setupV1AndV2CommonRoutes,
};
