// modules
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express.Router();
const rootApp = express();

const db = require('./storage.js');
const auth = require('./auth.js');
const config = require('./config');

// functionality

async function nextItem(req, res) {
  const item = await db.getItem(req.user.id);
  return res.json(item);
}

async function getQuestions(req, res) {
  const answeredQuestions = await db.answeredQuestions(req.user.id);
  res.json(answeredQuestions);
}

async function submitQuestAnswer(req, res) {
  const answerData = req.body;
  answerData.userId = req.user.id;
  await db.insertQuestionAnswer(answerData);
  // TODO send response depending on insert success
  res.json();
}

async function submitJobChoice(req, res) {
  const jobData = req.body;
  jobData.userId = req.user.id;
  switch (jobData.choice) {
    case 'like':
    case 'dislike':
    case 'showLater':
      await answerJob(jobData);
      break;
    case 'shortlist-add':
      await shortlistItem(jobData);
      await answerJob(jobData);
      break;
    case 'shortlist-remove':
      await shortlistItemRemove(jobData);
      break;
    default:
      console.log('unrecognized choice in submitJobChoice');
  }
  // TODO send response depending on answer insert success (or failure)
  res.json();
}

async function getJobs(req, res) {
  const jobs = await db.answeredJobs(req.user.id);
  return res.json(jobs);
}

async function answerJob(jobData) {
  await db.insertChoice(jobData);
}

async function shortlistItem(jobData) {
  await db.insertShortlist(jobData);
}

async function shortlistItemRemove(jobData) {
  await db.removeShortlist(jobData);
}

async function resetAccount(req) {
  await db.resetUserAccount(req.user.id);
}

// routes

app.use(cookieParser());
app.use(auth.authenticator);

app.use('/user', auth.guardMiddleware);

app.get('/user/next-item', asyncWrap(nextItem));

app.get('/user/jobs', asyncWrap(getJobs));
app.post('/user/jobs', express.json(), asyncWrap(submitJobChoice));

app.get('/user/questions', asyncWrap(getQuestions));
app.post('/user/questions', express.json(), asyncWrap(submitQuestAnswer));

app.get('/user/reset-account', express.json(), asyncWrap(resetAccount));

// the following is outside /user because it doesn't require valid login
app.get('/user-id', (req, res) => res.send({ user: req.user }));

// wrap async function for express.js error handling
function asyncWrap(f) {
  return (req, res, next) => {
    Promise.resolve(f(req, res, next)).catch((e) => next(e || new Error()));
  };
}

// start server

app.use(express.static('client'));


rootApp.use(config.DEPLOYMENT_ROOT || '/', app);

// http://localhost:8080/
const port = process.env.PORT || undefined;
rootApp.listen(port, () =>
  console.log(`Listening on port ${port}!`),
);
