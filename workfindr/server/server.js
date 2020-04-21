// server.js

// modules
const express = require('express');
const app = express();

// functionality

// Make async later
async function nextSwipeItem(req, res) {
  await res.json(itemsList.pop());
}

// async function getShortlist(req, res) {
//   await res.json();
// }

// routes

app.get('/user/next-item', asyncWrap(nextSwipeItem));

// swipe page data

const testJobs = {
  jobs: [{
    id: 0,
    title: 'Plumber',
    description: 'Red dungarees and hat included',
    image: 'img/tempImage.png',
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

const itemsList = testJobs.jobs.concat(testQuestions.questions);

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
