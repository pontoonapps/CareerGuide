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
    WHERE pontoonapps_workfindr2.likes.user_id = ?
    ORDER BY likes.time_stamp DESC`;
  const [swipedJobs] = await sql.query(query, userId);
  return swipedJobs;
}

async function answeredQuestions(userId) { // Answered Questions
  const sql = await sqlPromise;

  // Do we need to include an image here?
  const query = `
    SELECT
      qst.id,
      qst.question_en AS question,
      opt.label_en as answer
    FROM pontoonapps_workfindr2.questions
      AS qst
    INNER JOIN
    pontoonapps_workfindr2.answers
      AS ans
      ON qst.id=ans.question_id
        AND ans.user_id=?
    INNER JOIN
    pontoonapps_workfindr2.options
      AS opt
      ON ans.option_number=opt.option_number
        AND ans.question_id=opt.question_id`;

  const [questions] = await sql.query(query, userId);
  const options = await getOptions(0, questions.length);

  for (let i = 0; i < questions.length; i++) {
    const optArr = [];
    for (let j = 0; j < options.length; j++) {
      if (questions[i].id === options[j].question_id) {
        optArr.push(options[j]);
      }
    }
    questions[i].options = optArr;
  }

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

async function getOptions(minId, maxId = minId) {
  if (maxId <= 0) {
    return; // If maxId <= zero, output will be empty, so why run the query at all
  }
  const sql = await sqlPromise;
  const query = `
  SELECT option_number, question_id, label_en
  FROM pontoonapps_workfindr2.options
  WHERE question_id
  BETWEEN ? AND ?
  ORDER BY question_id, option_number asc`;
  const [options] = await sql.query(query, [minId, maxId]);
  return options;
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

  const questionQuery = `
    SELECT id, title_en, question_en
    FROM pontoonapps_workfindr2.questions
    WHERE id NOT IN (
      SELECT question_id
      FROM pontoonapps_workfindr2.answers
      WHERE user_id = ?
    )
    LIMIT 1`;

  const [questions] = await sql.query(questionQuery, userId);
  if (questions.length === 0) {
    return;
  }
  const questionData = questions[0];
  questionData.options = await getOptions(questionData.id);
  return questionData;
}

async function insertQuestionAnswer(ansData) {
  const sql = await sqlPromise;

  const userId = ansData.userId;
  const questionId = ansData.itemId;
  const optionNumber = ansData.choice;
  const query = `
    INSERT INTO pontoonapps_workfindr2.answers
      (user_id, question_id, option_number)
    VALUES
      (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      option_number = ?`;
  await sql.query(query, [userId, questionId, optionNumber, optionNumber]);
}

async function insertSwipe(swipeData) {
  const sql = await sqlPromise;
  const userId = swipeData.userId;
  const jobId = swipeData.itemId;
  let answer;
  switch (swipeData.choice) {
    case 'like':
      answer = 1;
      break;
    case 'dislike':
      answer = 2;
      break;
    case 'showLater':
      answer = 3;
      break;
  }
  const query = `
    INSERT INTO pontoonapps_workfindr2.likes
      (user_id, job_id, type)
    VALUES
      (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      type = ?`;
  await sql.query(query, [userId, jobId, answer, answer]);
}

async function insertShortlist(swipeData) {
  const sql = await sqlPromise;
  const query = `
    INSERT INTO pontoonapps_workfindr2.shortlists
      (user_id, job_id)
    VALUES
      (?, ?)`;
  await sql.query(query, [swipeData.userId, swipeData.itemId]);
}

async function removeShortlist(swipeData) {
  const sql = await sqlPromise;
  const query = `
    DELETE FROM pontoonapps_workfindr2.shortlists
      WHERE
        user_id=?
      AND
        job_id=?`;
  await sql.query(query, [swipeData.userId, swipeData.itemId]);
}

module.exports = {
  answeredQuestions,
  swipedJobs,
  getSwipeItem,
  insertQuestionAnswer,
  insertSwipe,
  insertShortlist,
  removeShortlist,
};
