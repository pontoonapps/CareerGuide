// modules
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const db = require('./storage.js');
const auth = require('./auth.js');
const mysql = require('mysql');

// database connection

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'pont',
  password: 'PONT1423',
});

// connection.query('SELECT * FROM `pontoonapps_workfindr2`.`categories`;', function (err, res, fields) {
//   if (err) {
//     return console.log(err);
//   }
//   for (const result of res) {
//     console.log(result);
//   }
// });

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
  connection.query('SELECT job_id FROM shortlist WHERE user_id=1');
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

function mysqlError(err, res, fields) {
  if (err) {
    return console.log(err);
  }
  for (const result of res) {
    console.log(result);
  }
}

async function getJobs(req, res) {
  const username = req.params.username;
  // get user id from username
  connection.connect();
  const query = 'SELECT id FROM `pontoonapps_jobseeker`.`users` WHERE first_name = \'' + username + '\';';
  connection.query(query, function (err, res, fields) {
    if (err) {
      return console.log(err);
    }
    console.log(res[0]);
  });
  connection.end();
  // get jobs that user has swiped on

  // return jobs to server


  // gets job for either shortlist page or swipe history page


  console.log(username);
  const jobs = await db.swipedJobs();
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

let itemsList = db.refreshItemList(); // allows for infinite swiping while testing swipe page

// routes

app.use(cookieParser());
app.use(auth.authenticator);

app.use('/user', auth.guardMiddleware);

app.get('/user/next-item', asyncWrap(nextSwipeItem));

app.get('/user/jobs/:username', asyncWrap(getJobs));
app.post('/user/jobs', express.json(), asyncWrap(submitJobSwipe));

app.get('/user/questions', asyncWrap(getQuestions));
app.post('/user/questions', express.json(), asyncWrap(subQuestAns));

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
const port = process.env.PORT || 8080;
app.listen(port, () =>
  console.log(`Listening on port ${port}!`),
);
