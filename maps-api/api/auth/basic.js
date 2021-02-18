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
  if (user === 'guest_account') {
    // find whether the password identifies a guest-account-enabled training centre
    const trainingCentre = await db.findGuestAccount(pwd);
    if (trainingCentre != null) {
      authObj.role = 'guest';
      authObj.trainingCentreID = trainingCentre;
      return true;
    } else {
      return false;
    }
  } else {
    const userRole = await db.findUserRole(user, pwd);
    if (userRole != null) {
      authObj.id = userRole.id;
      authObj.role = userRole.role;
      return true;
    } else {
      return false;
    }
  }
}
