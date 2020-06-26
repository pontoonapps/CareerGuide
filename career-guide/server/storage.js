const mysql = require('mysql2/promise');
const config = require('./config');
const seedrandom = require('seedrandom');

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
    FROM pontoonapps_careerguide.jobs
    JOIN pontoonapps_careerguide.categories
      ON pontoonapps_careerguide.jobs.category_id = pontoonapps_careerguide.categories.id
    JOIN pontoonapps_careerguide.likes
      ON pontoonapps_careerguide.jobs.id = pontoonapps_careerguide.likes.job_id
    LEFT JOIN pontoonapps_careerguide.shortlists
      ON pontoonapps_careerguide.likes.job_id = pontoonapps_careerguide.shortlists.job_id
     AND pontoonapps_careerguide.likes.user_id = pontoonapps_careerguide.shortlists.user_id
    LEFT JOIN pontoonapps_jobseeker.users
      ON pontoonapps_careerguide.shortlists.user_id = pontoonapps_jobseeker.users.id
    WHERE pontoonapps_careerguide.likes.user_id = ?
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
    FROM pontoonapps_careerguide.questions
    INNER JOIN pontoonapps_careerguide.answers
      ON questions.id = answers.question_id
      AND answers.user_id = ?
    INNER JOIN pontoonapps_careerguide.options
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

async function getItem(userId) {
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
      jobs.teamwork,
      jobs.physical_activity,
      jobs.creativity,
      jobs.driving,
      jobs.travel,
      jobs.hours_flexibility,
      jobs.care_work,
      jobs.danger,
      likes.type,
      likes.time_stamp AS timeStamp
    FROM      pontoonapps_careerguide.jobs
    JOIN      pontoonapps_careerguide.categories
      ON      jobs.category_id = categories.id
    LEFT JOIN pontoonapps_careerguide.likes
      ON      jobs.id = likes.job_id
    WHERE jobs.id NOT IN (
      SELECT job_id
      FROM pontoonapps_careerguide.likes
      WHERE likes.user_id = 2
      AND likes.type <> 'show later'
    )`;

  const [jobs] = await sql.query(query, userId);
  const profileMatchingJobs = await filterJobsToMatchQuestionnaire(jobs, userId);
  const twelveHoursAgo = Date.now() - (1000 * 60 * 60 * 12); // 12 hours in milliseconds
  // valid jobs to show are not liked or were liked with show later more than 12 hours ago
  const unseenJobs = profileMatchingJobs.filter(job => {
    if (job.type === null || (job.timeStamp < twelveHoursAgo && job.type === 'show later')) {
      return true;
    }
  });

  // get show laters less than 12 hours old and sort from oldest to newest
  let newShowLaters = profileMatchingJobs.filter(job => {
    if (job.type === 'show later' && job.timeStamp > twelveHoursAgo) {
      return true;
    }
  });
  newShowLaters = newShowLaters.sort((jobA, jobB) => { return jobA.timeStamp - jobB.timeStamp; });

  // if there are no unseen jobs return the oldest shortlisted job
  if (unseenJobs.length !== 0) {
    return getPseudoRandomItem(unseenJobs);
  } else if (newShowLaters.length !== 0) {
    return newShowLaters[0];
  } else {
    return null;
  }
}

// select a pseudo-random job to return next
// seeded randomness assures the user sees the same job next if they refresh
// return a predictable random element from an array
// randomness is seeded by array length
function getPseudoRandomItem(arr) {
  const rng = seedrandom(String(arr.length));
  const i = Math.floor(rng() * arr.length);
  return arr[i];
}

async function getQuestionnaireProfile(userId) {
  const sql = await sqlPromise;

  const query = `
    SELECT
      jobs_column,
      min,
      max
    FROM pontoonapps_careerguide.answers
    JOIN pontoonapps_careerguide.questions
      ON questions.id = answers.question_id
    JOIN pontoonapps_careerguide.options
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
    FROM pontoonapps_careerguide.questions
    JOIN pontoonapps_careerguide.options
      ON questions.id = options.question_id
    WHERE questions.id = (
      SELECT questions.id
      FROM pontoonapps_careerguide.questions
      WHERE questions.id NOT IN (
        SELECT question_id
        FROM pontoonapps_careerguide.answers
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
    INSERT INTO pontoonapps_careerguide.answers
      (user_id, question_id, option_number)
    VALUES
      (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      option_number = ?`;
  await sql.query(query, [ansData.userId, ansData.itemId, ansData.choice, ansData.choice]);
}

async function insertChoice(jobData) {
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
    INSERT INTO pontoonapps_careerguide.likes
      (user_id, job_id, type)
    VALUES
      (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      type = ?,
      time_stamp = NOW()`;
  await sql.query(query, [jobData.userId, jobData.itemId, answer, answer]);
}

async function insertShortlist(jobData) {
  const sql = await sqlPromise;

  const query = `
    INSERT INTO pontoonapps_careerguide.shortlists
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
    DELETE FROM pontoonapps_careerguide.shortlists
      WHERE
        user_id = ?
      AND
        job_id = ?`;
  await sql.query(query, [jobData.userId, jobData.itemId]);
}

module.exports = {
  answeredQuestions,
  answeredJobs,
  getItem,
  insertQuestionAnswer,
  insertChoice,
  insertShortlist,
  removeShortlist,
};
