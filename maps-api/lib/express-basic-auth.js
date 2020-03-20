/*
 * Simple Express.js HTTP basic auth middleware.
 *
 * Extended by Jacek Kopecky github/@jacekkopecky with the following changes:
 * - give req.auth to the authorizer,
 * - use async authorizers automatically,
 * - authorizer cannot use callback anymore
 *
 * copied from https://raw.githubusercontent.com/LionC/express-basic-auth/00bb29fdd638f5cda8025d4398be97d528ce3f6f/index.js
 * the original does not include a licence file, but does say "ISC" in package.json
 */

const auth = require('basic-auth');
const assert = require('assert');
const timingSafeEqual = require('crypto').timingSafeEqual;

// Credits for the actual algorithm go to github/@Bruce17
// Thanks to github/@hraban for making me implement this
function safeCompare(userInput, secret) {
  const userInputLength = Buffer.byteLength(userInput);
  const secretLength = Buffer.byteLength(secret);

  const userInputBuffer = Buffer.alloc(userInputLength, 0, 'utf8');
  userInputBuffer.write(userInput);
  const secretBuffer = Buffer.alloc(userInputLength, 0, 'utf8');
  secretBuffer.write(secret);

  return !!(timingSafeEqual(userInputBuffer, secretBuffer) & userInputLength === secretLength);
}

function ensureFunction(option, defaultValue) {
  if (option === undefined) { return function () { return defaultValue; }; }

  if (typeof option !== 'function') { return function () { return option; }; }

  return option;
}

function buildMiddleware(options) {
  const challenge = options.challenge !== undefined ? !!options.challenge : false;
  const users = options.users || {};
  const authorizer = options.authorizer || staticUsersAuthorizer;
  const getResponseBody = ensureFunction(options.unauthorizedResponse, 'Unauthorized');
  const realm = ensureFunction(options.realm);

  assert(typeof users === 'object', 'Expected an object for the basic auth users, found ' + typeof users + ' instead');
  assert(typeof authorizer === 'function', 'Expected a function for the basic auth authorizer, found ' + typeof authorizer + ' instead');

  function staticUsersAuthorizer(username, password) {
    for (const i of Object.keys(users)) {
      if (safeCompare(username, i) & safeCompare(password, users[i])) {
        return true;
      }
    }

    return false;
  }

  return async function authMiddleware(req, res, next) {
    const authentication = auth(req);

    if (!authentication) { return unauthorized(); }

    try {
      const authObj = {
        displayName: authentication.name,
      };

      const approved = await authorizer(authentication.name, authentication.pass, authObj);

      if (approved) {
        req.auth = authObj;
        return next();
      } else {
        return unauthorized();
      }
    } catch (e) {
      next(e);
    }

    function unauthorized() {
      if (challenge) {
        let challengeString = 'Basic';
        const realmName = realm(req);

        if (realmName) { challengeString += ' realm="' + realmName + '"'; }

        res.set('WWW-Authenticate', challengeString);
      }

      // TODO: Allow response body to be JSON (maybe autodetect?)
      const response = getResponseBody(req);

      if (typeof response === 'string') { return res.status(401).send(response); }

      return res.status(401).json(response);
    }
  };
}

buildMiddleware.safeCompare = safeCompare;
module.exports = buildMiddleware;
