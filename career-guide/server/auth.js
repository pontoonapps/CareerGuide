const fetch = require('node-fetch');
const config = require('./config');
const storage = require('./storage');

const GUEST_COOKIE = 'pontoonapps_cg_guest';
const GUEST_COOKIE_OPTS = {
  maxAge: 31 * 24 * 60 * 60 * 1000, // a month
};

module.exports = {
  authenticator: process.env.TESTING_DUMMY_AUTH ? dummyCookieAuth : phpAuth,
  guardMiddleware: requireValidUser,
  guestLogin: guestLogin,
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

async function guestLogin(req, res) {
  // if already logged in, respond with "forbidden"
  if (req.user && req.user.id != null) {
    res.sendStatus(403);
    return;
  }

  const guestUserName = await storage.createGuestUser();

  res.cookie(GUEST_COOKIE, guestUserName, GUEST_COOKIE_OPTS);
  res.send(`Welcome user ${guestUserName}`);
}
