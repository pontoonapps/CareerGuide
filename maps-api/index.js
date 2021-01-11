const express = require('express');
const path = require('path');
const cors = require('cors');

const config = require('./config');

const rootApp = express();

// allow local testing of pages
rootApp.use(cors({
  origin: 'http://localhost:8080',
  credentials: true,
}));

const api = require('./api');

const root = config.DEPLOYMENT_ROOT || '/';

rootApp.use(path.join(root, 'v2/'), api.v2);
rootApp.use(root, api.v1);

rootApp.listen(process.env.PORT || undefined);
