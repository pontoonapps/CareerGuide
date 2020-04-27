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

function submitQuestionAnswer(req, res) {
  // get variables from req body

  const choice = req.params.choice;
  const qid = req.body.jobid; // qid short for questionid

  // save question answer in DB
  console.log('Choice:', choice);
  console.log('questionID:', qid);
  res.json();
}

async function getShortlist() {
  const jobs = await db.shortlistedJobs();
  return jobs;
}

async function getSwiped() {
  const jobs = await db.swipedJobs();
  return jobs;
}

function submitJobSwipe(choice, jobid) {
  // get variables from req body

  // const choice = req.params.choice;
  // const jobid = req.body.jobid;

  switch(choice) {
    case 'like': swipeJob(choice, jobid); break;
    case 'dislike': swipeJob(choice, jobid); break;
    case 'shortlist': addToShortlist(choice, jobid); break;
  }
}

async function getJobs(req, res) {
  let jobs = [];
  // Checks if there is a query called choice passed
    switch(req.query.choice) {
      case 'shortlist': jobs = await getShortlist(); break;
      case 'swiped': jobs = await getSwiped(); break;
    }
    return res.json(jobs);
}

function swipeJob(choice, jobid) {
  // save swipe in DB
  console.log('Choice:', choice);
  console.log('JobID:', jobid);
}

function addToShortlist(choice, jobid) {
  // save shortlist in DB
  console.log('Choice:', choice);
  console.log('Toggle JobID:', jobid);
}

// routes

app.get('/user/next-item', asyncWrap(nextSwipeItem));

app.get('/user/jobs', asyncWrap(getJobs));
app.post('/user/jobs', express.json(), asyncWrap(submitJobSwipe));

app.get('/user/questions', asyncWrap(getQuestions));
app.post('/user/questions', express.json(), asyncWrap(submitQuestionAnswer));

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
