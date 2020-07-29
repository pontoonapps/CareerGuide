const express = require('express');
const path = require('path');

const config = require('./config');

const rootApp = express();
const api = require('./api');

rootApp.use(path.join(config.DEPLOYMENT_ROOT || '/', 'v2/'), api.v2);
rootApp.use(config.DEPLOYMENT_ROOT || '/', api.v1);

rootApp.listen(process.env.PORT || undefined);
