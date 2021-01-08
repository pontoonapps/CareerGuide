// basic-auth (email and password) checked against the database

const basicAuth = require('../../lib/express-basic-auth');
const db = require('../../db').common;

module.exports = () => {
  return basicAuth({
    authorizer: checkDBUser,
  });
};

async function checkDBUser(user, pwd, authObj) {
  const userRole = await db.findUserRole(user, pwd);
  console.log(userRole);
  if (userRole != null) {
    authObj.id = userRole.id;
    authObj.role = userRole.role;
    return true;
  } else {
    return false;
  }
}
