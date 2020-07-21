const fetch = require('node-fetch');
const config = require('./config');
const storage = require('./storage');

module.exports = {
  authenticator: process.env.TESTING_DUMMY_AUTH ? dummyCookieAuth : phpAuth,
  guardMiddleware: requireValidUser,
};

const knownUsers = [
  undefined, // no index 0
  'jacek',
  'kane',
  'pontuz',
  'test4',
  'test5',
  'test6',
  'test7',
  'test8',
  'test9',
];

async function dummyCookieAuth(req, res, next) {
  const name = req.cookies.PHPSESSID;
  if (name) {
    const pontoonId = knownUsers.indexOf(name);
    if (pontoonId > 0) {
      let id = await storage.getUserIdForPontoonUser(pontoonId);
      if (id == null) id = await storage.registerPontoonUser(pontoonId);
      req.user = { id };
    } else if (name === 'recruiter') {
      req.user = { recruiter: 10 };
    } else if (name === 'admin') {
      req.user = { admin: 0 };
    }
  }
  next();
}

/*
 * check with /is_logged_in.php whether the user is logged in
 */
async function phpAuth(req, res, next) {
  try {
    const fetchResp = await fetch(config.LOGIN_CHECK_URL, {
      method: 'GET',
      headers: {
        cookie: req.get('cookie'),
      },
    });

    if (!fetchResp.ok) {
      next(new Error(`login check at ${config.LOGIN_CHECK_URL} returned ${fetchResp.status}`));
      return;
    }

    const loggedIn = await fetchResp.json();

    if (loggedIn.logged_in) {
      let id = await storage.getUserIdForPontoonUser(loggedIn.user_id);
      if (id == null) id = await storage.registerPontoonUser(loggedIn.user_id);

      // put user information in the request
      req.user = {
        id: id,
        recruiter: loggedIn.recruiter_id,
        admin: loggedIn.admin_id,
      };
    }
    next();
  } catch (e) {
    next(new Error(`login check at ${config.LOGIN_CHECK_URL} threw ${e.message}`));
  }
}

function requireValidUser(req, res, next) {
  if (!req.user || req.user.id == null) {
    res.sendStatus(401);
  } else {
    next();
  }
}
