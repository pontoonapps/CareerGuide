// server.js

// modules
const express = require('express');
const app = express();

// functionality

// Make async later
async function nextSwipeItem(req, res) {
  if (itemsList.length === 0) {
    refreshItemsList();
  }
  await res.json(itemsList.pop());
}

async function getSwiped(req, res) {
  await res.sendStatus(404);
}

async function getQuestions(req, res) {
  await res.sendStatus(404);
}

async function getShortlist(req, res) {
  await res.json(slistJobs);
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

function parseInput(req, res) {
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
app.get('/user/jobs/swiped', asyncWrap(getSwiped)); // F
app.get('/user/questions', asyncWrap(getQuestions)); // G
app.get('user/jobs?shortlist', asyncWrap(getShortlist)); // H
app.post('/user/jobs', express.json(), asyncWrap(parseInput)); // B+C+I - How are we structuring this?
app.post('/user/questions', express.json(), asyncWrap(ansQuestion)); // E

// swipe page data

const testJobs = {
  jobs: [{
    id: 0,
    title: 'Plumber',
    description: 'Red dungarees and hat included',
  }, {
    id: 1,
    title: 'Programmer',
    description: 'Light up keyboard provided',
    image: 'img/tempImage.png',
  }, {
    id: 2,
    title: 'Con artist',
    description: 'Steals your valuable possessions',
    image: 'img/tempImage.png',
  }, {
    id: 3,
    title: 'Teacher',
    description: '"Might" teach you things',
    image: 'img/tempImage.png',
  }],
};

const testQuestions = {
  questions: [{
    id: 0,
    title: 'Do you like getting hands on?',
    image: 'img/tempImage.png',
  }, {
    id: 1,
    title: 'Are you good with computers?',
    image: 'img/tempImage.png',
  }, {
    id: 2,
    title: 'Can you make 10+ cups of tea in one go?',
    image: 'img/tempImage.png',
  }, {
    id: 3,
    title: 'Can you play guitar?',
    image: 'img/tempImage.png',
  }],
};

const slistJobs = {
  jobs: [{
    id: 0,
    title: 'Teacher',
    description: 'Can teach you how to do "X"',
    image: 'img/tempimage.png',
  }, {
    id: 1,
    title: 'Plumber',
    description: 'Knows things about plumbing',
    image: 'img/tempimage.png',
  }, {
    id: 2,
    title: 'Priest',
    description: 'Likes god',
    image: 'img/tempimage.png',
  }],
};

let itemsList;
refreshItemsList(); // allows for inifinte swiping while testing swip page

function refreshItemsList() {
  itemsList = testJobs.jobs.concat(testQuestions.questions);
}


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
app.listen(8080);
