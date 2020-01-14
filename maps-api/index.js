const express = require('express');
const mysql = require('mysql2/promise');
const config = require('./config');

const rootApp = express();
const app = express.Router({
  caseSensitive: true,
  strict: true,
});

rootApp.use(config.DEPLOYMENT_ROOT || '/', app);


app.get('/', msg('hi, testing'));
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
