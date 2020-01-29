const mysql = require('mysql2/promise');
const hashy = require('hashy');
const config = require('./config');

const dbConn = mysql.createConnection({
  host: 'localhost',
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_DATABASE,
});

async function testCount() {
  const sql = await dbConn;
  const [rows] = await sql.query('SELECT COUNT(*) AS count FROM `users`');
  const count = Number(rows[0].count);
  return count;
}

async function findUser(user, pwd) {
  try {
    const sql = await dbConn;
    const query = `SELECT id, hashed_password
                   FROM users
                   WHERE email = ?`;

    const [rows] = await sql.query(query, [user]);
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

async function listUserPins(userId) {
  const sql = await dbConn;
  const query = `SELECT name, category, description, phone, website,
                        email, address_line_1, address_line_2,
                        postcode, latitude, longitude, notes
                 FROM map_pins
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

async function deleteUserPin(userId, pinName) {
  const sql = await dbConn;
  const query = `DELETE
                 FROM map_pins
                 WHERE user_id = ? AND name = ?`;
  const [rows] = await sql.query(query, [userId, pinName]);
  return rows.affectedRows > 0;
}

module.exports = {
  testCount,
  findUser,
  listUserPins,
  deleteUserPin,
};
