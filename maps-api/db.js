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
                        postcode, latitude, longitude, notes,
                        true as user_pin
                 FROM user_map_pins
                 WHERE user_id = ?
                 UNION
                 SELECT name, category, description, phone, website,
                        email, address_line_1, address_line_2,
                        postcode, latitude, longitude, notes,
                        false as user_pin
                 FROM training_centre_map_pins
                 JOIN training_centre_assignments
                 USING (training_centre_id)
                 WHERE user_id = ?`;
  const [rows] = await sql.query(query, [userId, userId]);
  return extractPinInfo(rows);
}

async function listTrainingCentrePins(tcId) {
  const sql = await dbConn;
  const query = `SELECT name, category, description, phone, website,
                        email, address_line_1, address_line_2,
                        postcode, latitude, longitude, notes,
                        true as user_pin
                 FROM training_centre_map_pins
                 WHERE training_centre_id = ?`;
  const [rows] = await sql.query(query, [tcId]);

  return extractPinInfo(rows);
}


function extractPinInfo(rows) {
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

    // userPin is always there
    pin.userPin = !!row.user_pin;
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

async function addUpdateTrainingCentrePin(tcId, pin) {
  const sql = await dbConn;
  const query =
    `INSERT INTO training_centre_map_pins (training_centre_id, name, category,
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
  await sql.query(query, [[tcId, pin.name, pin.category,
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

async function deleteTrainingCentrePin(tcId, pinName) {
  const sql = await dbConn;
  const query = `DELETE
                 FROM training_centre_map_pins
                 WHERE training_centre_id = ? AND name = ?`;
  const [rows] = await sql.query(query, [tcId, pinName]);
  return rows.affectedRows > 0;
}

async function findUserTrainingCentre(userId) {
  const sql = await dbConn;
  const query = `SELECT first_name, last_name, email
                 FROM recruiters
                 JOIN training_centre_assignments
                   ON recruiters.id = training_centre_assignments.training_centre_id
                 WHERE user_id = ?
                 LIMIT 1`; // we only expect one
  const [rows] = await sql.query(query, [userId]);

  if (!rows.length === 0) return null;

  const r = rows[0];
  return {
    name: {
      first: r.first_name,
      last: r.last_name,
    },
    email: r.email,
  };
}

async function listTrainingCentreUsers(tcId) {
  const sql = await dbConn;
  const query = `SELECT email
                 FROM users
                 JOIN training_centre_assignments
                   ON users.id = training_centre_assignments.user_id
                 WHERE training_centre_id = ?`;
  const [rows] = await sql.query(query, [tcId]);

  return rows.map(r => r.email);
}

async function updateTrainingCentreUsers(tcId, add, remove) {
  add = add || [];
  remove = remove || [];

  const sqlPool = await dbConn;
  const sqlConn = await sqlPool.getConnection();
  try {
    await sqlConn.beginTransaction();

    if (remove.length > 0) {
      const removeQuery = `DELETE FROM training_centre_assignments
                           WHERE training_centre_id = ?
                           AND user_id IN (SELECT id
                                           FROM users
                                           WHERE email IN (?)
                                          )`;
      await sqlConn.query(removeQuery, [tcId, remove]);
    }

    if (add.length > 0) {
      const addQuery = `INSERT IGNORE
                        INTO training_centre_assignments
                             (user_id, training_centre_id)
                        SELECT id AS user_id, ? AS training_centre_id
                        FROM users
                        WHERE email IN (?)`;
      await sqlConn.query(addQuery, [tcId, add]);
    }
    await sqlConn.commit();
  } catch (err) {
    await sqlConn.rollback();
  } finally {
    sqlConn.release();
  }
}

module.exports = {
  findUserRole,
  findUserTrainingCentre,
  listUserPins,
  listTrainingCentrePins,
  addUpdateUserPin,
  addUpdateTrainingCentrePin,
  deleteUserPin,
  deleteTrainingCentrePin,
  listTrainingCentreUsers,
  updateTrainingCentreUsers,
};
