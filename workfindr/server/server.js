// server.js

// modules
const express = require('express');
const app = express();
const db = require('./storage.js');

// functionality

function nextSwipeItem(req, res) {
  // for now the test data array stores questions AND answers
  // we will need to check if the user needs questions or jobs
  if (itemsList.length === 0) {
    itemsList = db.refreshItemList();
  }
  res.json(itemsList.pop());
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

async function getShortlist() {
  const jobs = await db.swipedJobs();
  return jobs;
}

async function getSwiped() {
  const jobs = await db.swipedJobs();
  return jobs;
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
  // gets job for either shortlist page or swipe history page
  let jobs = [];
  switch (req.query.choice) { // TODO is choice the best name here??
    case 'shortlist':
      jobs = await getShortlist();
      break;
    case 'swiped':
      jobs = await getSwiped();
      break;
  }
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

app.get('/user/next-item', asyncWrap(nextSwipeItem));

app.get('/user/jobs', asyncWrap(getJobs));
app.post('/user/jobs', express.json(), asyncWrap(submitJobSwipe));

app.get('/user/questions', asyncWrap(getQuestions));
app.post('/user/questions', express.json(), asyncWrap(subQuestAns));

let itemsList = db.refreshItemList(); // allows for infinite swiping while testing swipe page

// wrap async function for express.js error handling
function asyncWrap(f) {
  return (req, res, next) => {
    Promise.resolve(f(req, res, next))
      .catch((e) => next(e || new Error()));
  };
}

// start server

app.use(express.static('client'));

// http://localhost:8080/
app.listen(8080, () =>
  console.log(`Listening on port ${8080}!`),
);
