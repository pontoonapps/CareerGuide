// authentication by checking with the server's PHP scripts whether the user is logged in
// this requires the PHP session cookie


const fetch = require('node-fetch');

const LOGIN_CHECK_URL = 'https://pontoonapps.com/is_logged_in.php';

/*
 * authentication on pontoonapps.com
 * check with /is_logged_in.php whether the user is logged in
 */
async function phpLoginInfo(req) {
  const fetchResp = await fetch(LOGIN_CHECK_URL, {
    method: 'GET',
    headers: {
      cookie: req.get('cookie'),
    },
  });

  if (!fetchResp.ok) {
    throw new Error(`login check at ${LOGIN_CHECK_URL} returned ${fetchResp.status}`);
  }

  const loggedIn = await fetchResp.json();
  return loggedIn.logged_in ? loggedIn : null;
}

async function authenticate(req, res, next) {
  if (req.auth) {
    // already authenticated, ignore cookie
    next();
    return;
  }

  try {
    const loggedIn = await phpLoginInfo(req);

    if (loggedIn) {
      if (loggedIn.user_id != null) {
        req.auth = {
          id: loggedIn.user_id,
          role: 'user',
        };
      } else if (loggedIn.recruiter_id != null) {
        req.auth = {
          id: loggedIn.recruiter_id,
          role: 'recruiter',
        };
      }
    }

    next();
  } catch (e) {
    next(e || new Error());
  }
}

module.exports = () => authenticate;
