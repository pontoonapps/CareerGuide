// basic-auth (email and password) checked against the database

const basicAuth = require('../../lib/express-basic-auth');
const db = require('../../db').common;

module.exports = () => {
  const authMiddleware = basicAuth({
    authorizer: checkDBUser,
  });

  return (req, res, next) => {
    if (req.auth != null) {
      next(); // already authenticated
    } else {
      authMiddleware(req, res, next);
    }
  };
};

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
