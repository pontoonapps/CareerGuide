const mysql = require('mysql2/promise');
const config = require('./config');
const seedrand = require('seedrandom');

const sqlPromise = mysql.createPool(config.mysql);

async function answeredJobs(userId) {
  const sql = await sqlPromise;

  const query = `
    SELECT
      jobs.id,
      jobs.title_en AS title_en,
      jobs.titre_fr AS title_fr,
      jobs.description_en AS description_en,
      jobs.description_fr AS description_fr,
      categories.icon_filename AS image,
      likes.type AS answer,
      shortlists.job_id AS shortlist
    FROM pontoonapps_workfindr2.jobs
    JOIN pontoonapps_workfindr2.categories
      ON pontoonapps_workfindr2.jobs.category_id = pontoonapps_workfindr2.categories.id
    JOIN pontoonapps_workfindr2.likes
      ON pontoonapps_workfindr2.jobs.id = pontoonapps_workfindr2.likes.job_id
    LEFT JOIN pontoonapps_workfindr2.shortlists
      ON pontoonapps_workfindr2.likes.job_id = pontoonapps_workfindr2.shortlists.job_id
     AND pontoonapps_workfindr2.likes.user_id = pontoonapps_workfindr2.shortlists.user_id
    LEFT JOIN pontoonapps_jobseeker.users
      ON pontoonapps_workfindr2.shortlists.user_id = pontoonapps_jobseeker.users.id
    WHERE pontoonapps_workfindr2.likes.user_id = ?
    ORDER BY likes.time_stamp DESC`;
  const [answeredJobs] = await sql.query(query, userId);
  return answeredJobs;
}

async function answeredQuestions(userId) { // Answered Questions
  const sql = await sqlPromise;

  const query = `
    SELECT
      questions.id AS question_id,
      questions.title_en AS title_en,
      questions.question_en AS question_en,
      options.label_en AS answer_en,
      options.option_number AS answer_number,
      answers.option_number AS answered
    FROM pontoonapps_workfindr2.questions
    INNER JOIN pontoonapps_workfindr2.answers
      ON questions.id = answers.question_id
      AND answers.user_id = ?
    INNER JOIN pontoonapps_workfindr2.options
      ON questions.id = options.question_id
    ORDER BY question_id, answer_number`;

  const [questionsData] = await sql.query(query, userId);
  const questions = [];

  // aggregate the options
  let options;
  let currentQuestion;
  for (const row of questionsData) {
    if (currentQuestion !== row.question_id) {
      options = []; // reset options array for this question
      currentQuestion = row.question_id; // update id of current question

      questions.push({
        question_id: row.question_id,
        title_en: row.title_en,
        question_en: row.question_en,
        answer_number: row.answered,
        options: options,
      });
    }
    // push the current question's option data
    options.push({ answer_en: row.answer_en, answer_number: row.answer_number });
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

async function getNextJob(userId) {
  const sql = await sqlPromise;

  const query = `
    SELECT
      jobs.id,
      jobs.title_en,
      jobs.description_en,
      categories.icon_filename AS image,
      teamwork,
      physical_activity,
      creativity,
      driving,
      travel,
      hours_flexibility,
      care_work,
      danger
    FROM pontoonapps_workfindr2.jobs
      JOIN pontoonapps_workfindr2.categories
      ON jobs.category_id = pontoonapps_workfindr2.categories.id
    WHERE jobs.id NOT IN (
      SELECT job_id
      FROM pontoonapps_workfindr2.likes
      WHERE likes.user_id = ?
      AND (likes.type <> 'show later' OR
           likes.time_stamp > NOW() - INTERVAL 12 HOUR)
    )`;

  const [jobs] = await sql.query(query, userId);
  const matchingJobs = await filterJobsToMatchQuestionnaire(jobs, userId);

  // Review please
  let seed = seedrand();
  let val = Math.floor(seed()*matchingJobs.length);

  return matchingJobs[val]; // TODO use seedrandom to get a random job seeded by length
}

async function getQuestionnaireProfile(userId) {
  const sql = await sqlPromise;

  const query = `
    SELECT
      jobs_column,
      min,
      max
    FROM pontoonapps_workfindr2.answers
    JOIN pontoonapps_workfindr2.questions
      ON questions.id = answers.question_id
    JOIN pontoonapps_workfindr2.options
      ON answers.question_id = options.question_id
     AND answers.option_number = options.option_number
    WHERE user_id = ?`;

  const [profile] = await sql.query(query, userId);
  return profile;
}

async function filterJobsToMatchQuestionnaire(jobs, userId) {
  // get user's questionnaire answers
  const profile = await getQuestionnaireProfile(userId);

  const retArr = [];

  for (const job of jobs) {
    // check whether the job fits every profile parameter
    const matchesProfile = profile.every(param => {
      return job[param.jobs_column] >= param.min &&
             job[param.jobs_column] <= param.max;
    });
    if (matchesProfile) retArr.push(job);
  }

  return retArr;
}

async function getNextQuestion(userId) {
  const sql = await sqlPromise;

  const query = `
    SELECT
      questions.id AS question_id,
      questions.title_en AS title_en,
      questions.question_en AS question_en,
      options.label_en AS answer_en,
      options.option_number AS answer_number
    FROM pontoonapps_workfindr2.questions
    JOIN pontoonapps_workfindr2.options
      ON questions.id = options.question_id
    WHERE questions.id = (
      SELECT questions.id
      FROM pontoonapps_workfindr2.questions
      WHERE questions.id NOT IN (
        SELECT question_id
        FROM pontoonapps_workfindr2.answers
        WHERE user_id = ?
      )
      ORDER BY questions.id ASC
      LIMIT 1
    )
    ORDER BY answer_number`;
  const [questionData] = await sql.query(query, [userId, userId]);

  if (questionData[0] === undefined) {
    return;
  }

  // aggregate the options
  const options = [];
  for (const row of questionData) {
    options.push({ label_en: row.answer_en, option_number: row.answer_number });
  }

  const question = {
    id: questionData[0].question_id,
    options: options,
    question_en: questionData[0].question_en,
    title_en: questionData[0].title_en,
  };

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

async function insertSwipe(jobData) {
  const sql = await sqlPromise;

  let answer;
  switch (jobData.choice) {
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
  await sql.query(query, [jobData.userId, jobData.itemId, answer, answer]);
}

async function insertShortlist(jobData) {
  const sql = await sqlPromise;

  const query = `
    INSERT INTO pontoonapps_workfindr2.shortlists
      (user_id, job_id)
    VALUES
      (?, ?)
    ON DUPLICATE KEY UPDATE
      job_id = ?`;
  await sql.query(query, [jobData.userId, jobData.itemId, jobData.itemId]);
}

async function removeShortlist(jobData) {
  const sql = await sqlPromise;

  const query = `
    DELETE FROM pontoonapps_workfindr2.shortlists
      WHERE
        user_id=?
      AND
        job_id=?`;
  await sql.query(query, [jobData.userId, jobData.itemId]);
}

module.exports = {
  answeredQuestions,
  answeredJobs,
  getSwipeItem,
  insertQuestionAnswer,
  insertSwipe,
  insertShortlist,
  removeShortlist,
};
