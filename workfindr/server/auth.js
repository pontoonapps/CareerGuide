module.exports = {
  authenticator: dummyCookieAuth,
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

function dummyCookieAuth(req, res, next) {
  const name = req.cookies.PHPSESSID;
  if (name) {
    const id = knownUsers.indexOf(name);
    if (id > 0) {
      req.user = { id };
    }
  }
  next();
}

function requireValidUser(req, res, next) {
  if (!req.user) {
    res.sendStatus(401);
  } else {
    next();
  }
}
