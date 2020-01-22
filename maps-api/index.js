const express = require('express');

const config = require('./config');

const rootApp = express();
const app = require('./api');

rootApp.use(config.DEPLOYMENT_ROOT || '/', app);

rootApp.listen(process.env.PORT || undefined);
