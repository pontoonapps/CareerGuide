const mysql = require('mysql2/promise');
const hashy = require('hashy');

const config = require('../config');

const dbConn = mysql.createPool({
  host: 'localhost',
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_DATABASE,
  socketPath: config.DB_SOCKETPATH,
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
  const query = `SELECT id, name, category, description, phone, website,
                        email, address_line_1, address_line_2,
                        postcode, latitude, longitude, notes,
                        null as tc_email
                 FROM user_map_pins_v2
                 WHERE user_id = ?
                 UNION
                 SELECT p.id, p.name, p.category, p.description, p.phone, p.website,
                        p.email, p.address_line_1, p.address_line_2,
                        p.postcode, p.latitude, p.longitude, p.notes,
                        r.email as tc_email
                 FROM training_centre_map_pins_v2 p
                 JOIN training_centre_assignments a
                 USING (training_centre_id)
                 JOIN recruiters r
                   ON r.id = a.training_centre_id
                 WHERE user_id = ?`;
  const [rows] = await sql.query(query, [userId, userId]);
  return extractPinInfo(rows);
}

async function listTrainingCentrePins(tcId) {
  const sql = await dbConn;
  const query = `SELECT id, name, category, description, phone, website,
                        email, address_line_1, address_line_2,
                        postcode, latitude, longitude, notes,
                        null as tc_email
                 FROM training_centre_map_pins_v2
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
    if (row.id != null)             pin.id              = row.id;
    if (row.name != null)           pin.name            = row.name;
    if (row.latitude != null)       pin.latitude        = row.latitude;
    if (row.longitude != null)      pin.longitude       = row.longitude;
    if (row.category != null)       pin.category        = row.category;
    if (row.description != null)    pin.description     = row.description;
    if (row.phone != null)          pin.phone           = row.phone;
    if (row.website != null)        pin.website         = row.website;
    if (row.email != null)          pin.email           = row.email;
    if (row.address_line_1 != null) pin.address_line_1  = row.address_line_1;
    if (row.address_line_2 != null) pin.address_line_2  = row.address_line_2;
    if (row.postcode != null)       pin.postcode        = row.postcode;
    if (row.notes != null)          pin.notes           = row.notes;
    if (row.tc_email != null) pin.training_centre_email = row.tc_email;
    /* eslint-enable no-multi-spaces */

    // userPin is always there
    pin.userPin = row.tc_email == null;
  }
  return pins;
}

async function getUserPinIDByName(userId, pinName) {
  const sql = await dbConn;
  const query = `SELECT id
                 FROM user_map_pins_v2
                 WHERE user_id = ? AND name = ?`;
  const [rows] = await sql.query(query, [userId, pinName]);
  return rows.length === 0 ? null : rows[0].id;
}

async function getTrainingCentrePinIDByName(tcId, pinName, table) {
  const sql = await dbConn;
  const query = `SELECT id
                 FROM training_centre_map_pins_v2
                 WHERE training_centre_id = ? AND name = ?`;
  const [rows] = await sql.query(query, [tcId, pinName]);
  return rows.length === 0 ? null : rows[0].id;
}

async function addUpdateUserPinV1(userId, pin) {
  // find pin ID if the user already has a pin with this name
  const pinId = await getUserPinIDByName(userId, pin.name);

  // call v2 version of this function now that we have the ID
  if (pinId != null) {
    pin.id = pinId;
    return updateUserPinV2(userId, pin);
  } else {
    return addUserPinV2(userId, pin);
  }
}

function addUpdateUserPinV2(userId, pin) {
  if (pin.id != null) {
    return updateUserPinV2(userId, pin);
  } else {
    return addUserPinV2(userId, pin);
  }
}

async function updateUserPinV2(userId, pin) {
  const sql = await dbConn;
  const query =
    `UPDATE user_map_pins_v2
     SET
       name = ?,
       latitude = ?,
       longitude = ?,
       category = ?,
       description = ?,
       phone = ?,
       website = ?,
       email = ?,
       address_line_1 = ?,
       address_line_2 = ?,
       postcode = ?,
       notes = ?
     WHERE id = ?
       AND user_id = ?`;

  const [rows] = await sql.query(query, [
    pin.name,
    pin.latitude,
    pin.longitude,
    pin.category,
    pin.description,
    pin.phone,
    pin.website,
    pin.email,
    pin.address_line_1,
    pin.address_line_2,
    pin.postcode,
    pin.notes,
    pin.id,
    userId,
  ]);

  return rows.affectedRows > 0 ? pin : null;
}

async function addUserPinV2(userId, pin) {
  const sql = await dbConn;
  const query =
    `INSERT INTO user_map_pins_v2 (user_id, name, latitude, longitude,
       category, description, phone, website, email,
       address_line_1, address_line_2, postcode, notes)
     VALUES (?)`;
  const [rows] = await sql.query(query, [[userId, pin.name, pin.latitude, pin.longitude,
    pin.category, pin.description, pin.phone, pin.website, pin.email,
    pin.address_line_1, pin.address_line_2, pin.postcode, pin.notes]]);

  pin.id = rows.insertId;
  return pin;
}

async function addUpdateTrainingCentrePinV1(tcId, pin) {
  // find pin ID if the traning centre already has a pin with this name
  const pinId = await getTrainingCentrePinIDByName(tcId, pin.name);

  // call v2 version of this function now that we have the ID
  if (pinId != null) {
    pin.id = pinId;
    return updateTrainingCentrePinV2(tcId, pin);
  } else {
    return addTrainingCentrePinV2(tcId, pin);
  }
}

function addUpdateTrainingCentrePinV2(tcId, pin) {
  if (pin.id != null) {
    return updateTrainingCentrePinV2(tcId, pin);
  } else {
    return addTrainingCentrePinV2(tcId, pin);
  }
}

async function updateTrainingCentrePinV2(tcId, pin) {
  const sql = await dbConn;
  const query =
    `UPDATE training_centre_map_pins_v2
     SET
       name = ?,
       latitude = ?,
       longitude = ?,
       category = ?,
       description = ?,
       phone = ?,
       website = ?,
       email = ?,
       address_line_1 = ?,
       address_line_2 = ?,
       postcode = ?,
       notes = ?
     WHERE id = ?
       AND training_centre_id = ?`;

  const [rows] = await sql.query(query, [
    pin.name,
    pin.latitude,
    pin.longitude,
    pin.category,
    pin.description,
    pin.phone,
    pin.website,
    pin.email,
    pin.address_line_1,
    pin.address_line_2,
    pin.postcode,
    pin.notes,
    pin.id,
    tcId,
  ]);

  return rows.affectedRows > 0 ? pin : null;
}

async function addTrainingCentrePinV2(tcId, pin) {
  const sql = await dbConn;
  const query =
    `INSERT INTO training_centre_map_pins_v2
       (training_centre_id, name, latitude, longitude,
        category, description, phone, website, email,
        address_line_1, address_line_2, postcode, notes)
     VALUES (?)`;
  const [rows] = await sql.query(query,
    [[tcId, pin.name, pin.latitude, pin.longitude,
      pin.category, pin.description, pin.phone, pin.website, pin.email,
      pin.address_line_1, pin.address_line_2, pin.postcode, pin.notes]]);

  pin.id = rows.insertId;
  return pin;
}

async function deleteUserPinV1(userId, pinName) {
  const sql = await dbConn;
  const query = `DELETE
                 FROM user_map_pins_v2
                 WHERE user_id = ? AND name = ?`;
  const [rows] = await sql.query(query, [userId, pinName]);
  return rows.affectedRows > 0;
}

async function deleteTrainingCentrePinV1(tcId, pinName) {
  const sql = await dbConn;
  const query = `DELETE
                 FROM training_centre_map_pins_v2
                 WHERE training_centre_id = ? AND name = ?`;
  const [rows] = await sql.query(query, [tcId, pinName]);
  return rows.affectedRows > 0;
}

async function deleteUserPinV2(userId, pinId) {
  const sql = await dbConn;
  const query = `DELETE
                 FROM user_map_pins_v2
                 WHERE user_id = ? AND id = ?`;
  const [rows] = await sql.query(query, [userId, pinId]);
  return rows.affectedRows > 0;
}

async function deleteTrainingCentrePinV2(tcId, pinId) {
  const sql = await dbConn;
  const query = `DELETE
                 FROM training_centre_map_pins_v2
                 WHERE training_centre_id = ? AND id = ?`;
  const [rows] = await sql.query(query, [tcId, pinId]);
  return rows.affectedRows > 0;
}

async function findUserTrainingCentres(userId) {
  const sql = await dbConn;
  const query = `SELECT first_name, last_name, email
                 FROM recruiters
                 JOIN training_centre_assignments
                   ON recruiters.id = training_centre_assignments.training_centre_id
                 WHERE user_id = ?`;
  const [rows] = await sql.query(query, [userId]);

  return rows.map(r => (
    {
      name: {
        first: r.first_name,
        last: r.last_name,
      },
      email: r.email,
    }
  ));
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

async function removeUserFromTrainingCentre(userId, tcEmail) {
  const sql = await dbConn;
  const removeQuery = `DELETE FROM training_centre_assignments
                       WHERE user_id = ?
                       AND training_centre_id IN
                         (SELECT id
                          FROM recruiters
                          WHERE email = ?
                         )`;
  const [rows] = await sql.query(removeQuery, [userId, tcEmail]);
  return rows.affectedRows > 0;
}

module.exports = {
  v1: {
    addUpdateUserPin: addUpdateUserPinV1,
    addUpdateTrainingCentrePin: addUpdateTrainingCentrePinV1,
    deleteUserPin: deleteUserPinV1,
    deleteTrainingCentrePin: deleteTrainingCentrePinV1,
  },
  v2: {
    addUpdateUserPin: addUpdateUserPinV2,
    addUpdateTrainingCentrePin: addUpdateTrainingCentrePinV2,
    deleteUserPin: deleteUserPinV2,
    deleteTrainingCentrePin: deleteTrainingCentrePinV2,
  },
  v1v2: {
    listUserPins,
    listTrainingCentrePins,
    findUserTrainingCentres,
    listTrainingCentreUsers,
    updateTrainingCentreUsers,
    removeUserFromTrainingCentre,
  },
  common: {
    findUserRole,
  },
};
