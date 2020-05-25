// modules
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const db = require('./storage.js');
const auth = require('./auth.js');

// functionality

async function nextSwipeItem(req, res) {
  const username = req.query.name;
  const userid = await db.getUserID(username);
  const swipeItem = await db.getSwipeItem(userid);
  return res.json(swipeItem);
}

function getQuestions(req, res) {
  res.json(db.ansrdQuestns());
}

function subQuestAns(req, res) {
  const choice = req.body.choice;
  const questid = req.body.itemid;

  // save question answer in DB
  console.log('subQuestAns: ');
  console.log('Choice:', choice);
  console.log('questionID:', questid);
  res.json();
}

function submitJobSwipe(req, res) {
  const choice = req.body.choice;
  const jobid = req.body.itemid;
  switch (choice) {
    case 'like':
      swipeJob(choice, jobid);
      break;
    case 'dislike':
      swipeJob(choice, jobid);
      break;
    case 'showLater':
      swipeJob(choice, jobid);
      break;
    case 'shortlist-add':
      shortlistItem(choice, jobid);
      swipeJob('like', jobid);
      break;
    case 'shortlist-rem':
      shortlistItem(choice, jobid);
      break;
    default:
      console.log('unrecognized choice in submitJobSwipe');
  }
  res.json();
}

async function getJobs(req, res) {
  const username = req.query.name;
  const userid = await db.getUserID(username);
  const jobs = await db.swipedJobs(userid);
  return res.json(jobs);
}

function swipeJob(choice, jobid) {
  // save swipe in DB
  console.log('SwipeJob: ');
  console.log('Choice:', choice);
  console.log('JobID:', jobid);
}

function shortlistItem(choice, jobid) {
  // save shortlist in DB
  console.log('shortlistItem: ');
  console.log('Choice:', choice);
  console.log('Toggle JobID:', jobid);
}

// routes

app.use(cookieParser());
app.use(auth.authenticator);

app.use('/user', auth.guardMiddleware);

app.get('/user/next-item', asyncWrap(nextSwipeItem));

app.get('/user/jobs', asyncWrap(getJobs));
app.post('/user/jobs', express.json(), asyncWrap(submitJobSwipe));

app.get('/user/questions', asyncWrap(getQuestions));
app.post('/user/questions', express.json(), asyncWrap(subQuestAns));

// wrap async function for express.js error handling
function asyncWrap(f) {
  return (req, res, next) => {
    Promise.resolve(f(req, res, next)).catch((e) => next(e || new Error()));
  };
}

// start server

app.use(express.static('client'));

// http://localhost:8080/
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}!`));
