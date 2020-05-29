const mysql = require('mysql2/promise');
const config = require('./config');

const sqlPromise = mysql.createConnection(config.mysql);

async function swipedJobs(userId) {
  const sql = await sqlPromise;

  // get swiped jobs (route B)
  const query = `
    SELECT
      jobs.id,
      jobs.title_en AS title_en,
      jobs.titre_fr AS title_fr,
      jobs.description_en AS description_en,
      jobs.description_fr AS description_fr,
      categories.icon_filename AS image,
      likes.type AS swipe,
      shortlists.job_id AS shortlist
    FROM pontoonapps_workfindr2.jobs
    JOIN pontoonapps_workfindr2.categories
      ON pontoonapps_workfindr2.jobs.category_id = pontoonapps_workfindr2.categories.id
    JOIN pontoonapps_workfindr2.likes
      ON pontoonapps_workfindr2.jobs.id = pontoonapps_workfindr2.likes.job_id
    LEFT JOIN pontoonapps_workfindr2.shortlists
      ON pontoonapps_workfindr2.likes.job_id = pontoonapps_workfindr2.shortlists.job_id
    LEFT JOIN pontoonapps_jobseeker.users
      ON pontoonapps_workfindr2.shortlists.user_id = pontoonapps_jobseeker.users.id
    WHERE pontoonapps_workfindr2.likes.user_id = ?`;
  const [swipedJobs] = await sql.query(query, userId);
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

async function answeredQuestions(userId) { // Answered Questions
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

  const [questions] = await sql.query(query, userId);
  return questions;
}

async function getSwipeItem(userId) {
  const question = await getNextQuestion(userId);
  if (question !== undefined) {
    return question;
  }

  const job = await getNextJob(userId);
  return job;
}

async function getNextJob(userId) {
  const sql = await sqlPromise;

  const query = `
  SELECT
    jobs.id,
    jobs.title_en,
    jobs.titre_fr,
    jobs.description_en,
    jobs.description_fr,
    categories.icon_filename AS image
  FROM pontoonapps_workfindr2.jobs
    JOIN pontoonapps_workfindr2.categories
    ON jobs.category_id = pontoonapps_workfindr2.categories.id
  WHERE jobs.id NOT IN (
    SELECT job_id
    FROM pontoonapps_workfindr2.likes
    WHERE likes.user_id = ?
  )
  ORDER BY RAND()
  LIMIT 1`;
  const [jobs] = await sql.query(query, userId);
  return jobs[0];
}

async function getNextQuestion(userId) {
  const sql = await sqlPromise;

  const query = `
  SELECT id, title_en, question_en
  FROM pontoonapps_workfindr2.questions
  WHERE id NOT IN (
    SELECT question_id
    FROM pontoonapps_workfindr2.answers
    WHERE user_id = ?
  )
  LIMIT 1`;
  const [questions] = await sql.query(query, userId);
  return questions[0];
}

async function insertQuestionAnswer(ansData) {
  const sql = await sqlPromise;

  const userId = ansData.userId;
  const questionId = ansData.itemId;
  let answer;
  switch (ansData.choice) {
    case 'yes':
      answer = 1;
      break;
    case 'no':
      answer = 2;
      break;
  }
  const query = `
    INSERT INTO pontoonapps_workfindr2.answers
      (user_id, question_id, option_number)
    VALUES
      (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      option_number = ?`;
  await sql.query(query, [userId, questionId, answer, answer]);
  // TODO if insert is successful return true else false
}

async function insertSwipe(swipeData) {
  const sql = await sqlPromise;
  const userId = swipeData.userId;
  const jobId = swipeData.itemId;
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
  const query = `
    INSERT INTO pontoonapps_workfindr2.likes
      (user_id, job_id, type)
    VALUES
      (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      type = ?`;
  await sql.query(query, [userId, jobId, type, type]);
}

async function insertShortlist(swipeData) {
  const sql = await sqlPromise;
  const query = `
  INSERT INTO pontoonapps_workfindr2.shortlists
    (user_id, job_id)
  VALUES
    (?, ?);`;
  await sql.query(query, [swipeData.userId, swipeData.itemId]);
}

async function removeShortlist(swipeData) {
  const sql = await sqlPromise;
  const query = `
  DELETE FROM pontoonapps_workfindr2.shortlists
    WHERE
      user_id=?
    AND
      job_id=?;`;
  await sql.query(query, [swipeData.userId, swipeData.itemId]);
}

module.exports = {
  questions,
  answeredQuestions,
  swipedJobs,
  getSwipeItem,
  insertQuestionAnswer,
  insertSwipe,
  insertShortlist,
  removeShortlist,
};
