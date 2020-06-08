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

  const query = `
    SELECT
      questions.id AS question_id,
      questions.title_en AS title_en,
      questions.question_en AS question_en,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          "answer_number", options.option_number,
          "answer_en", options.label_en
          )
        ) AS options,
      answers.option_number AS answer_number
    FROM pontoonapps_workfindr2.questions
    INNER JOIN pontoonapps_workfindr2.answers
      ON questions.id = answers.question_id
      AND answers.user_id = ?
    INNER JOIN pontoonapps_workfindr2.options
      ON questions.id = options.question_id
    GROUP BY questions.id`;
  const [questionsData] = await sql.query(query, userId);
  return questionsData;
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

  const question = {};
  const query = `
    SELECT qst.id, qst.title_en, qst.question_en, opt.option_number, opt.label_en
    FROM (
      SELECT id, title_en, question_en
      FROM pontoonapps_workfindr2.questions
      WHERE id NOT IN (
        SELECT question_id
        FROM pontoonapps_workfindr2.answers
        WHERE user_id = ?
      )
      LIMIT 1
    ) AS qst
    JOIN pontoonapps_workfindr2.options AS opt ON qst.id = opt.question_id
    ORDER BY qst.id, opt.option_number DESC`;
  const [questionData] = await sql.query(query, userId);

  if (questionData.length === 0) {
    return;
  }

  question.id = questionData[0].id;
  question.question_en = questionData[0].question_en;
  question.title_en = questionData[0].title_en;
  question.options = [];
  for (const row of questionData) {
    question.options.push({
      option_number: row.option_number,
      label_en: row.label_en,
    });
  }
  return question;
}

async function insertQuestionAnswer(ansData) {
  const sql = await sqlPromise;
  const query = `
    INSERT INTO pontoonapps_workfindr2.answers
      (user_id, question_id, option_number)
    VALUES
      (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      option_number = ?`;
  await sql.query(query, [ansData.userId, ansData.itemId, ansData.choice, ansData.choice]);
}

async function insertSwipe(swipeData) {
  const sql = await sqlPromise;
  const userId = swipeData.userId;
  const jobId = swipeData.itemId;
  let answer;
  switch (swipeData.choice) {
    case 'shortlist-add':
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
      (?, ?)
    ON DUPLICATE KEY UPDATE
      job_id = ?`;
  await sql.query(query, [swipeData.userId, swipeData.itemId, swipeData.itemId]);
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
