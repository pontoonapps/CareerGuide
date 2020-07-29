const express = require('express');
const path = require('path');

const config = require('./config');

const rootApp = express();
const api = require('./api');

const root = config.DEPLOYMENT_ROOT || '/';

rootApp.use(path.join(root, 'v2/'), api.v2);
rootApp.use(root, api.v1);

rootApp.listen(process.env.PORT || undefined);
