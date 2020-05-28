// modules
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express.Router();
const rootApp = express();

const db = require('./storage.js');
const auth = require('./auth.js');
const config = require('./config');

// functionality

async function nextSwipeItem(req, res) {
  const swipeItem = await db.getSwipeItem(req.user.id);
  return res.json(swipeItem);
}

async function getQuestions(req, res) {
  const ansrdQst = await db.ansrdQuestns(req.user.id);
  res.json(ansrdQst);
}

async function submitQuestAnswer(req, res) {
  // FIXME seperate SQL statement required for submit question ans and update question answer
  const answerData = req.body;
  answerData.userid = req.user.id;
  await db.insertQuestAnswer(answerData);
  // TODO send response depending on insert success
  res.json();
}

async function submitJobSwipe(req, res) {
  const swipeData = req.body;
  swipeData.userId = req.user.id;
  switch (swipeData.choice) {
    case 'like':
    case 'dislike':
    case 'showLater':
      await swipeJob(swipeData);
      break;
    case 'shortlist-add':
      await shortlistItem(swipeData);
      await swipeJob(swipeData);
      break;
    case 'shortlist-rem':
      await shortlistItem(swipeData);
      break;
    default:
      console.log('unrecognized choice in submitJobSwipe');
  }
  // TODO send response depending on swipe insert success (or failure)
  res.json();
}

async function getJobs(req, res) {
  const jobs = await db.swipedJobs(req.user.id);
  return res.json(jobs);
}

async function swipeJob(swipeData) {
  await db.insertSwipe(swipeData);
}

async function shortlistItem(swipeData) {
  await db.insertShortlist(swipeData);
}

// routes

app.use(cookieParser());
app.use(auth.authenticator);

app.use('/user', auth.guardMiddleware);

app.get('/user/next-item', asyncWrap(nextSwipeItem));

app.get('/user/jobs', asyncWrap(getJobs));
app.post('/user/jobs', express.json(), asyncWrap(submitJobSwipe));

app.get('/user/questions', asyncWrap(getQuestions));
app.post('/user/questions', express.json(), asyncWrap(submitQuestAnswer));

// wrap async function for express.js error handling
function asyncWrap(f) {
  return (req, res, next) => {
    Promise.resolve(f(req, res, next)).catch((e) => next(e || new Error()));
  };
}

// for testing purposes
app.get('/user/id', (req, res) => res.send({ user: req.user }));

// start server

app.use(express.static('client'));


rootApp.use(config.DEPLOYMENT_ROOT || '/', app);

// http://localhost:8080/
const port = process.env.PORT || undefined;
rootApp.listen(port, () =>
  console.log(`Listening on port ${port}!`),
);
