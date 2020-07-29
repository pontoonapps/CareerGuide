const express = require('express');

const checks = require('./checks');
const common = require('./common');
const db = require('../db').v2;
const v1v2 = require('./v1-and-v2');

const promiseWrap = common.promiseWrap;

const app = common.setupAppWithCommonRoutesAndAuth();
module.exports = app;

app.post('/pins', express.json(), promiseWrap(addPin));
app.post('/pins/delete', express.json(), promiseWrap(deletePin));

v1v2.setupV1AndV2CommonRoutes(app);

// server functions

async function addPin(req, res, next) {
  const pin = req.body;

  /* eslint-disable no-multi-spaces, space-in-parens */
  let validationProblems = '';
  if (!checks.numberOptional(pin.id                 )) validationProblems += 'NumberOptional(pin.id) ';
  if (!checks.stringRequired(pin.name,           255)) validationProblems += 'StringRequired(pin.name, max 255 chars) ';
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

  let updatedPin;

  switch (req.auth.role) {
    case 'user':
      updatedPin = await db.addUpdateUserPin(req.auth.id, pin);
      break;
    case 'recruiter':
      updatedPin = await db.addUpdateTrainingCentrePin(req.auth.id, pin);
      break;
    default:
      res.status(403).send('unrecognized user role');
  }

  if (updatedPin != null) {
    res.json(updatedPin);
  } else {
    res.sendStatus(409);
  }
}

async function deletePin(req, res, next) {
  if (!checks.numberRequired(req.body.id)) {
    res.sendStatus(400);
    return;
  }

  switch (req.auth.role) {
    case 'user':
      await db.deleteUserPin(req.auth.id, req.body.id);
      break;
    case 'recruiter':
      await db.deleteTrainingCentrePin(req.auth.id, req.body.id);
      break;
    default:
      res.status(403).send('unrecognized user role');
      return;
  }
  res.sendStatus(204);
}
