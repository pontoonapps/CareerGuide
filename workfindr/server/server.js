// server.js

// modules
const express = require('express');
const app = express();
const td = require('./testdata.js');

// functionality

function nextSwipeItem(req, res) {
  // for now the test data array stores questions AND answers
  // we will need to check if the user needs questions or jobs
  if (itemsList.length === 0) {
    itemsList = td.refreshIL();
  }
  res.json(itemsList.pop());
}

function getSwiped(req, res) {
  res.json(td.testSJs());
}

function getQuestions(req, res) {
  res.json(td.testAQs());
}

function getShortlist(req, res) {
  res.json(td.slistJs());
}

function ansQuestion(req, res) {
  // get variables from req body
  const choice = req.body.choice;
  const qid = req.body.jobid; // qid short for questionid

  // save question answer in DB
  console.log('Choice:', choice);
  console.log('questionID:', qid);
  res.json();
}

function submitJobSwipe(req, res) {
  // get variables from req body
  const choice = req.body.choice;
  const jobid = req.body.jobid;

  // if choice is shortlist don't swipe job
  if (choice !== 'shortlist') {
    res.json(swipeJob(choice, jobid));
  } else {
    res.json(toggleShortlist(choice, jobid));
  }
}

function swipeJob(choice, jobid) {
  // save swipe in DB
  console.log('Choice:', choice);
  console.log('JobID:', jobid);
}

function toggleShortlist(choice, jobid) {
  // save shortlist in DB
  console.log('Toggle Choice:', choice);
  console.log('Toggle JobID:', jobid);
}

// routes

app.get('/user/next-item', asyncWrap(nextSwipeItem)); // A+D
app.get('/user/jobs/swiped', express.json(), (getSwiped)); // F
app.get('/user/questions', asyncWrap(getQuestions)); // G
app.get('/user/jobs/shortlist', express.json(), asyncWrap(getShortlist)); // H
app.post('/user/jobs', express.json(), asyncWrap(submitJobSwipe)); // B+C+I
app.post('/user/questions', express.json(), asyncWrap(ansQuestion)); // E

let itemsList = td.refreshIL(); // allows for infinite swiping while testing swipe page

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
