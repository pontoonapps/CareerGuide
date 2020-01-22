const mysql = require('mysql2/promise');
const hashy = require('hashy');
const config = require('./config');

function initDB() {
  return mysql.createConnection({
    host: 'localhost',
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_DATABASE,
  });
}

async function testCount() {
  const sql = await initDB();
  const [rows] = await sql.query('SELECT COUNT(*) AS count FROM `users`');
  const count = Number(rows[0].count);
  return count;
}

async function findUser(user, pwd) {
  try {
    const sql = await initDB();
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

module.exports = {
  testCount,
  findUser,
};
