const mysql = require('mysql2/promise');
const config = require('./config');

const sqlPromise = mysql.createConnection(config.mysql);

async function swipedJobs(userid) {
  const sql = await sqlPromise;

  // get swiped jobs (route B)
  const querySJ = // querySwipedJobs
    `SELECT 
      jobs.id, 
      jobs.title_en AS title_en, 
      jobs.titre_fr AS title_fr,
      jobs.description_en AS description_en,
      jobs.description_fr AS description_fr, 
      categories.icon_filename AS image, 
      likes.type AS swipe, 
      shortlists.job_id AS shortlist 
    FROM pontoonapps_workfindr2.jobs 
    INNER JOIN pontoonapps_workfindr2.categories 
      ON pontoonapps_workfindr2.jobs.category_id = pontoonapps_workfindr2.categories.id
    INNER JOIN pontoonapps_workfindr2.likes 
      ON pontoonapps_workfindr2.jobs.id = pontoonapps_workfindr2.likes.job_id
    INNER JOIN pontoonapps_workfindr2.shortlists 
      ON pontoonapps_workfindr2.likes.job_id = pontoonapps_workfindr2.shortlists.job_id
    INNER JOIN pontoonapps_jobseeker.users 
      ON pontoonapps_workfindr2.shortlists.user_id = pontoonapps_jobseeker.users.id
    WHERE pontoonapps_jobseeker.users.id = ?`;
  const [rawSJ] = await sql.query(querySJ, userid);
  const swipedJobs = JSON.parse(JSON.stringify(rawSJ));
  return swipedJobs;
}

function questions() {
  const questions = {
    questions: [{
      id: 0,
      title: 'Do you like getting hands on?',
      image: 'img/agriculture.jpg',
    }, {
      id: 1,
      title: 'Are you good with computers?',
      image: 'img/it.jpg',
    }, {
      id: 2,
      title: 'Can you make 10+ cups of tea?',
      image: 'img/cater.jpg',
    }, {
      id: 3,
      title: 'Can you play guitar?',
      image: 'img/art.jpg',
    }],
  };

  return questions;
}

async function ansrdQuestns(userid) { // Answered Questions
  const sql = await sqlPromise;

  // Do we need to include an image here?
  const query = `
  SELECT 
  qst.id, 
  qst.question_en AS question,
  opt.label_en as answer 
  FROM pontoonapps_workfindr2.questions AS qst 
  INNER JOIN 
  pontoonapps_workfindr2.answers AS ans 
  ON qst.id=ans.question_id AND ans.user_id=?
  INNER JOIN
  pontoonapps_workfindr2.options AS opt
  ON ans.option_number=opt.option_number AND ans.question_id=opt.question_id;`;

  const [questions] = await sql.query(query, userid);
  return questions;
}

async function getSwipeItem(userid) {
  const sql = await sqlPromise;

  // TODO: The conversion from data using JSON.parse and JSON.stringify, is there a better solution?
  const queryQuestids =
    `SELECT id AS questid
    FROM pontoonapps_workfindr2.questions`;
  const [rawQuestids] = await sql.query(queryQuestids);
  const questids = JSON.parse(JSON.stringify(rawQuestids));
  const questidArr = [];
  for (const id of questids) {
    questidArr.push(id.questid);
  }

  // get number of answers provided by a user
  const queryAQI = // queryAnsweredQuestionIDs
    `SELECT question_id AS questid
    FROM pontoonapps_workfindr2.answers
    WHERE user_id = ?`;
  const [rawAnswrdQuests] = await sql.query(queryAQI, userid);
  const answrdQuests = JSON.parse(JSON.stringify(rawAnswrdQuests));
  const answrdQuestidArr = [];
  for (const id of answrdQuests) {
    answrdQuestidArr.push(id.questid);
  }

  // look for a question without answer, if all questions have answer find job, else send question
  const nextItem = {};
  nextItem.type = 'job';
  for (const questid of questidArr) {
    if (!answrdQuestidArr.includes(questid)) {
      nextItem.type = 'question';
      nextItem.id = questid;
      break;
    }
  }

  if (nextItem.type === 'question') {
    const queryGQ = // queryGetQuestion
      `SELECT id, title_en, question_en
      FROM pontoonapps_workfindr2.questions
      WHERE id = ?`;
    const [rawQuest] = await sql.query(queryGQ, nextItem.id);
    const quest = JSON.parse(JSON.stringify(rawQuest))[0];
    return quest;
  } else {
    // FIXME: We need to manage the duplicate entries. We are currently sending out jobs that has already been swiped on. This is causing a UnhandledPromiseRejection.
    // get list of job ids which have been swiped on (we don't want to show these to the user again)
    const queryGSJ = // queryGetSwipedJobs
      `SELECT job_id
      FROM pontoonapps_workfindr2.likes
      WHERE user_id = ?`;
    const [rawSwipedJobids] = await sql.query(queryGSJ, userid);
    const swipedJobids = JSON.parse(JSON.stringify(rawSwipedJobids));
    const swipedJobidArr = [];
    for (const id of swipedJobids) {
      swipedJobidArr.push(id.job_id);
    }

    // get list of job ids
    const queryGAJ = // queryGetAvailableJobs
      `SELECT id
      FROM pontoonapps_workfindr2.jobs`;
    const [rawJobids] = await sql.query(queryGAJ);
    const jobids = JSON.parse(JSON.stringify(rawJobids));
    const jobidArr = [];
    for (const id of jobids) {
      jobidArr.push(id.id);
    }

    // remove jobs already swiped from jobidArr
    for (const id of swipedJobidArr) {
      if (jobidArr.includes(id)) {
        jobidArr.splice(jobidArr.indexOf(id), 1);
      }
    }

    // select random ID from list of available jobs
    nextItem.id = jobidArr[Math.floor(Math.random() * jobidArr.length)];

    // get job data from database and send to client
    const queryGJ = // queryGetJob
      `SELECT 
        jobs.id AS id, 
        jobs.title_en AS title_en, 
        jobs.titre_fr AS title_fr, 
        jobs.description_en AS description_en, 
        jobs.description_fr AS description_fr,
        categories.icon_filename AS image
      FROM pontoonapps_workfindr2.jobs
      INNER JOIN pontoonapps_workfindr2.categories
        ON pontoonapps_workfindr2.jobs.category_id = pontoonapps_workfindr2.categories.id
      WHERE jobs.id = ?`;
    const [rawJob] = await sql.query(queryGJ, nextItem.id);
    const job = JSON.parse(JSON.stringify(rawJob))[0];
    // removing this broke the code as array was passed instead of object (please test changes)
    return job;
  }
}

async function getUserID(username) {
  const sql = await sqlPromise;
  const queryid =
    `SELECT id 
    FROM pontoonapps_jobseeker.users 
    WHERE first_name = ?`;

  const [rawId] = await sql.query(queryid, username);
  const id = JSON.parse(JSON.stringify(rawId))[0].id;
  return id;
}

async function insQuestAns(ansData) {
  const sql = await sqlPromise;

  const userid = ansData.userid;
  const questionid = ansData.itemid;
  let answer;
  switch (ansData.choice) {
    case 'yes':
      answer = 1;
      break;
    case 'no':
      answer = 2;
      break;
  }
  console.log(userid, questionid, answer);
  const queryIQA = // queryInsertQuestionAnswer
    `INSERT INTO pontoonapps_workfindr2.answers
      (user_id, question_id, option_number)
    VALUES
      (?, ?, ?)`;
  await sql.query(queryIQA, [userid, questionid, answer]);
  // TODO if insert is successful return true else false
}

async function insSwipe(swipeData) {
  const sql = await sqlPromise;
  const userid = swipeData.userid;
  const jobid = swipeData.itemid;
  let type;
  switch (swipeData.choice) {
    case 'shortlist-add': // automatic like on shortlist
    case 'like':
      type = 1;
      break;
    case 'dislike':
      type = 2;
      break;
    case 'showLater':
      type = 3;
      break;
  }
  const queryIJS = // queryInsertJobSwipe
    `INSERT INTO pontoonapps_workfindr2.likes
      (user_id, job_id, type)
    VALUES
      (?, ?, ?)`;
  await sql.query(queryIJS, [userid, jobid, type]);
}

function insShrtlst() {
  console.log('hello! This function will insert into the shortlists table');
}

module.exports = {
  questions,
  ansrdQuestns,
  swipedJobs,
  getSwipeItem,
  getUserID,
  insQuestAns,
  insSwipe,
  insShrtlst,
};
