const express = require('express');
const mysql = require('mysql2/promise');
// const cookieParser = require('cookie-parser');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const { URLSearchParams } = require('url');

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
app.post('/login', bodyParser.json(), login);
app.get('/count', sqlCount);

rootApp.use(express.static('public'));
rootApp.listen(process.env.PORT || undefined);

function msg(...message) {
  message = message.join('\n');
  return (req, res) => {
    res.type('text/plain');
    res.send(`${message}\n${new Date()}`);
  };
}

// function showCookies(req, res) {
//   res.json(req.cookies);
// }

async function isLoggedIn(req, res) {
  try {
    const fetchResp = await fetch(config.LOGIN_CHECK_URL, {
      method: 'GET',
      headers: {
        cookie: req.get('cookie'),
      },
    });

    if (!fetchResp.ok) {
      res.json({ error: fetchResp.status });
      return;
    }

    const loggedIn = await fetchResp.json();
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.json(loggedIn);
  } catch (e) {
    res.json('exception ' + e.message);
  }
}

async function login(req, res) {
  try {
    if (!req.body || !req.body.email || !req.body.password) {
      res.sendStatus(400);
      return;
    }

    const params = new URLSearchParams();
    params.append('email', req.body.email);
    params.append('password', req.body.password);

    const fetchResp = await fetch(config.LOGIN_URL, {
      method: 'POST',
      body: params,
      headers: {
        referer: 'https://pontoonapps.com/',
      },
    });

    if (!fetchResp.ok) {
      res.json({ error: fetchResp.status });
      return;
    }

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.json({
      headers: Array.from(fetchResp.headers),
      status: fetchResp.status,
      body: await fetchResp.text(),
    });
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
    host: 'localhost',
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_DATABASE,
  });
}
