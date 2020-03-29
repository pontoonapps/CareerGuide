const mysql = require('mysql2/promise');
const hashy = require('hashy');
const config = require('./config');

const dbConn = mysql.createPool({
  host: 'localhost',
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_DATABASE,
});

async function findUserInTable(user, pwd, table) {
  try {
    const sql = await dbConn;
    const query = `SELECT id, hashed_password
                   FROM ??
                   WHERE email = ?`;

    const [rows] = await sql.query(query, [table, user]);
    if (rows.length === 0) {
      return null;
    }

    const hash = rows[0].hashed_password;
    const match = await hashy.verify(pwd, hash);

    if (match) {
      return rows[0].id;
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
}

/*
 * Finds whether the system knows a recruiter or a user with this email/password.
 * If it finds a recruiter, it returns { recruiter: id },
 * otherwise if it finds a user, it returns { user: id }.
 * If no such user is found, returns null.
 */
async function findUserRole(user, pwd) {
  const recruiterId = await findUserInTable(user, pwd, 'recruiters');
  if (recruiterId != null) {
    return { id: recruiterId, role: 'recruiter' };
  }

  const userId = await findUserInTable(user, pwd, 'users');
  if (userId != null) {
    return { id: userId, role: 'user' };
  }

  return null;
}

async function listUserPins(userId) {
  const sql = await dbConn;
  const query = `SELECT name, category, description, phone, website,
                        email, address_line_1, address_line_2,
                        postcode, latitude, longitude, notes
                 FROM user_map_pins
                 WHERE user_id = ?`;
  const [rows] = await sql.query(query, [userId]);
  const pins = [];
  for (const row of rows) {
    const pin = {};
    pins.push(pin);

    // copy non-empty values only, formatted for maintainability
    /* eslint-disable no-multi-spaces */
    if (row.name != null)           pin.name           = row.name;
    if (row.category != null)       pin.category       = row.category;
    if (row.description != null)    pin.description    = row.description;
    if (row.phone != null)          pin.phone          = row.phone;
    if (row.website != null)        pin.website        = row.website;
    if (row.email != null)          pin.email          = row.email;
    if (row.address_line_1 != null) pin.address_line_1 = row.address_line_1;
    if (row.address_line_2 != null) pin.address_line_2 = row.address_line_2;
    if (row.postcode != null)       pin.postcode       = row.postcode;
    if (row.latitude != null)       pin.latitude       = row.latitude;
    if (row.longitude != null)      pin.longitude      = row.longitude;
    if (row.notes != null)          pin.notes          = row.notes;
    /* eslint-enable no-multi-spaces */

    // add userPin (for now we don't have training centre pins)
    pin.userPin = true;
  }
  return pins;
}

async function addUpdateUserPin(userId, pin) {
  const sql = await dbConn;
  const query =
    `INSERT INTO user_map_pins (user_id, name, category,
       description, phone, website, email, address_line_1,
       address_line_2, postcode, latitude, longitude, notes)
     VALUES (?)
     ON DUPLICATE KEY UPDATE
       category = VALUES(category),
       description = VALUES(description),
       phone = VALUES(phone),
       website = VALUES(website),
       email = VALUES(email),
       address_line_1 = VALUES(address_line_1),
       address_line_2 = VALUES(address_line_2),
       postcode = VALUES(postcode),
       latitude = VALUES(latitude),
       longitude = VALUES(longitude),
       notes = VALUES(notes)`;
  await sql.query(query, [[userId, pin.name, pin.category,
    pin.description, pin.phone, pin.website, pin.email, pin.address_line_1,
    pin.address_line_2, pin.postcode, pin.latitude, pin.longitude, pin.notes]]);
}

async function deleteUserPin(userId, pinName) {
  const sql = await dbConn;
  const query = `DELETE
                 FROM user_map_pins
                 WHERE user_id = ? AND name = ?`;
  const [rows] = await sql.query(query, [userId, pinName]);
  return rows.affectedRows > 0;
}

module.exports = {
  findUserRole,
  listUserPins,
  addUpdateUserPin,
  deleteUserPin,
};
