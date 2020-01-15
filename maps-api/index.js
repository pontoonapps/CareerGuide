const express = require('express');
const mysql = require('mysql2/promise');
// const cookieParser = require('cookie-parser');
const fetch = require('node-fetch');
const config = require('./config');

const rootApp = express();
const app = express.Router({
  caseSensitive: true,
  strict: true,
});

rootApp.use(config.DEPLOYMENT_ROOT || '/', app);


app.get('/', msg('hi, testing'));
// app.get('/env', msg(JSON.stringify(process.env)));
// app.get('/cook', cookieParser(), showCookies);
app.get('/is_logged_in', isLoggedIn);
app.get('/count', sqlCount);

rootApp.use(express.static('public'));
rootApp.listen(process.env.PORT || undefined);


function msg(...message) {
  message = message.join('\n');
  return (req, res) => {
    res.type('text/plain');
    res.send(`${message}\n${new Date()}`);
  }
}

function showCookies(req, res) {
  res.json(req.cookies);
}

async function isLoggedIn(req, res) {
  const fetchResp = await fetch(config.LOGIN_CHECK_URL, {
    method: 'GET',
    headers: {
      cookie: req.get('cookie'),
    },
  });

  if (!fetchResp.ok) {
    res.json('error ' + fetchResp.status);
    return;
  }

  try {
    const loggedIn = await fetchResp.json();
    res.json(loggedIn);
  } catch (e) {
    res.json('exception ' + e.message);
  }
}


async function sqlCount(req, res) {
  const sql = await init();
  const [rows] = await sql.query('SELECT COUNT(*) AS count FROM `users`');
  const count = Number(rows[0].count);
  res.send(`hi, there are ${count} users as of ${new Date()}`);
}

function init() {
  return mysql.createConnection({
    "host": "localhost",
    "user": config.DB_USER,
    "password": config.DB_PASSWORD,
    "database": config.DB_DATABASE,
  });
}
