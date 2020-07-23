const fetch = require('node-fetch');
const config = require('./config');
const storage = require('./storage');

/*
 * authentication on pontoonapps.com
 * check with /is_logged_in.php whether the user is logged in
 */
async function phpLoginInfo(req) {
  const fetchResp = await fetch(config.LOGIN_CHECK_URL, {
    method: 'GET',
    headers: {
      cookie: req.get('cookie'),
    },
  });

  if (!fetchResp.ok) {
    throw new Error(`login check at ${config.LOGIN_CHECK_URL} returned ${fetchResp.status}`);
  }

  const loggedIn = await fetchResp.json();
  return loggedIn.logged_in ? loggedIn : null;
}

/*
 * authentication of guest users with an extra cookie
 */
const GUEST_COOKIE = 'pontoonapps_cg_guest';
const GUEST_COOKIE_OPTS = {
  maxAge: 31 * 24 * 60 * 60 * 1000, // a month
};
const GUEST_COOKIE_CLEAR_OPTS = {
  maxAge: -24 * 60 * 60 * 1000, // a day ago, delete the cookie
};

async function getGuestLoginId(req, res) {
  const name = req.cookies[GUEST_COOKIE];
  if (!name) return null;

  const userInfo = await storage.getUserInfoForGuestUser(name);

  if (userInfo == null || userInfo.pontoonId != null) {
    // the guest user already has a pontoon user ID, the guest cookie is no longer necessary
    res.clearCookie(GUEST_COOKIE, GUEST_COOKIE_CLEAR_OPTS);
    return null;
  }

  if (userInfo != null) {
    // refresh the cookie
    res.cookie(GUEST_COOKIE, name, GUEST_COOKIE_OPTS);
    return userInfo.id;
  } else {
    return null;
  }
}

/*
 * testing authentication with dummy users
 * enabled with process.env.TESTING_DUMMY_AUTH
 */
const knownDummyUsers = [
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

// for testing purposes, just get the user name from the PHPSESSID cookie
function dummyLoginInfo(req) {
  const name = req.cookies.PHPSESSID;
  if (name) {
    const pontoonId = knownDummyUsers.indexOf(name);
    if (pontoonId > 0) {
      return { user_id: pontoonId };
    } else if (name === 'recruiter') {
      return { recruiter_id: 10 };
    } else if (name === 'admin') {
      return { admin_id: 0 };
    }
  }
  return null;
}

/*
 * actual authentication code
 */
const getRealUserLoginInfo = process.env.TESTING_DUMMY_AUTH ? dummyLoginInfo : phpLoginInfo;

async function authenticate(req, res, next) {
  try {
    const guestId = await getGuestLoginId(req, res);
    const loggedIn = await getRealUserLoginInfo(req);

    if (loggedIn) {
      // put user information in request
      req.user = {};

      if (loggedIn.user_id != null) {
        let id = await storage.getUserIdForPontoonUser(loggedIn.user_id);
        if (id == null) id = await storage.registerPontoonUser(loggedIn.user_id, guestId);
        req.user.id = id;
      }

      // copy information about other types of users
      req.user.recruiter = loggedIn.recruiter_id;
      req.user.admin = loggedIn.admin_id;
    } else if (guestId != null) {
      // guest ID is used only if the user is not otherwise logged in
      req.user = {
        id: guestId,
        guest: true,
      };
    }

    next();
  } catch (e) {
    next(e || new Error());
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
  if (req.user) {
    if (req.user.guest) {
      res.send('already logged in as guest');
      return;
    }
    if (req.user.id != null) {
      // if logged in as a normal user (not a guest), respond with "forbidden"
      res.sendStatus(403);
      return;
    }
  }

  const guestUserName = await storage.createGuestUser();

  res.cookie(GUEST_COOKIE, guestUserName, GUEST_COOKIE_OPTS);
  res.send(`Welcome user ${guestUserName}`);
}

function guestLogout(req, res) {
  res.clearCookie(GUEST_COOKIE, GUEST_COOKIE_CLEAR_OPTS);
  res.send('goodbye guest user');
}

module.exports = {
  authenticator: authenticate,
  guardMiddleware: requireValidUser,
  guestLogin,
  guestLogout,
};
