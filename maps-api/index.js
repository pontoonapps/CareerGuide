const express = require('express');
const mysql = require('mysql2/promise');
const basicAuth = require('express-basic-auth');
const hashy = require('hashy');

const config = require('./config');

const rootApp = express();
const app = express.Router({
  caseSensitive: true,
  strict: true,
});

const auth = basicAuth({
  authorizer: checkDBUser,
  authorizeAsync: true,
});

rootApp.use(config.DEPLOYMENT_ROOT || '/', app);

app.get('/', msg('hi, testing'));

app.use(checkApiKey);
app.get('/ping', msg('hi, api key working'));

app.use(auth);
app.get('/count', sqlCount);

rootApp.use(express.static('public'));
rootApp.listen(process.env.PORT || undefined);

function msg(...message) {
  message = message.join('\n');
  return (req, res) => {
    res.type('text/plain');
    res.send(`${message}\n${new Date()}\n`);
  };
}

async function sqlCount(req, res) {
  const sql = await initDB();
  const [rows] = await sql.query('SELECT COUNT(*) AS count FROM `users`');
  const count = Number(rows[0].count);
  res.send(`hi, there are ${count} users as of ${new Date()}\n`);
}

function initDB() {
  return mysql.createConnection({
    host: 'localhost',
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_DATABASE,
  });
}

function checkApiKey(req, res, next) {
  if (req.query.apiKey in config.RECOGNISED_API_KEYS) {
    next();
  } else {
    res.sendStatus(403);
  }
}

async function checkDBUser(user, pwd, cb) {
  try {
    const sql = await initDB();
    const query = `SELECT hashed_password
                   FROM users
                   WHERE email = ?`;
    const [rows] = await sql.query(query, [user]);
    if (rows.length === 0) {
      cb(null, false);
      return;
    }
    const hash = rows[0].hashed_password;
    const match = await hashy.verify(pwd, hash);
    cb(null, match === true);
  } catch (e) {
    cb(null, false);
  }
}
