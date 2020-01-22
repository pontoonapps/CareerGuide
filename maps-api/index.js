const express = require('express');

const basicAuth = require('./lib/express-basic-auth');
const db = require('./db');
const config = require('./config');

const rootApp = express();
const app = express.Router({
  caseSensitive: true,
  strict: true,
});

const auth = basicAuth({
  authorizer: db.checkDBUser,
});

rootApp.use(config.DEPLOYMENT_ROOT || '/', app);

app.get('/', msg('hi, testing'));

app.use(checkApiKey);
app.get('/ping', msg('hi, api key working'));

app.use(auth);
app.get('/count', db.sqlCount);

rootApp.use(express.static('public'));
rootApp.listen(process.env.PORT || undefined);

// server functions

function msg(...message) {
  message = message.join('\n');
  return (req, res) => {
    res.type('text/plain');
    res.send(`${message}\n${new Date()}\n`);
  };
}

function checkApiKey(req, res, next) {
  if (req.query.apiKey in config.RECOGNISED_API_KEYS) {
    next();
  } else {
    res.sendStatus(403);
  }
}
