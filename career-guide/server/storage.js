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
  // a fresh job is not liked or disliked but may be marked as show later
  const freshJobs = await getFreshJobs(userId);
  const profile = await getQuestionnaireProfile(userId); // get user's questionnaire answers

  // get list of jobs with lowest match score (higher match score is worse match)
  const noTimeStampRecent = removeRecentShowlaters(freshJobs);
  const closestMatches = await getClosestMatches(noTimeStampRecent, profile);

  if (closestMatches.length > 0) {
    for (const job of closestMatches) {
      console.log(job);
    }
    return getPseudoRandomItem(closestMatches);
  }

  // get show laters less than 12 hours old (sorted by sql in getUnlikedJobs)
  const recentShowLater = freshJobs.filter(job => job.timeStampRecent);

  if (recentShowLater.length > 0) {
    return recentShowLater[0];
  }

  return null;
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

async function getFreshJobs(userId) {
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
      (likes.time_stamp > NOW() - INTERVAL 12 HOUR) AS timeStampRecent
    FROM      pontoonapps_careerguide.jobs
    JOIN      pontoonapps_careerguide.categories
      ON      jobs.category_id = categories.id
    LEFT JOIN pontoonapps_careerguide.likes
      ON      jobs.id = likes.job_id
     AND      likes.user_id = ?
    WHERE likes.type IS NULL
       OR likes.type = 'show later'
    ORDER BY likes.time_stamp ASC`;

  const [jobs] = await sql.query(query, userId);
  return jobs;
}

function getClosestMatches(jobs, profile) {
  const scoredJobs = getMatchScore(jobs, profile);

  // sort by match score
  scoredJobs.sort((a, b) => { return a.matchScore - b.matchScore; });
  const lowestMatchScore = scoredJobs[0].matchScore;
  const closestMatches = [];
  for (const job of scoredJobs) {
    if (job.matchScore > lowestMatchScore) break;
    closestMatches.push(job);
  }
  return closestMatches;
}

function removeRecentShowlaters(jobs) {
  const noRecentShowLaters = [];
  for (const job of jobs) {
    if (job.timeStampRecent != null) continue; // new show laters culled as shown separately
    noRecentShowLaters.push(job);
  }
  return noRecentShowLaters;
}

function getMatchScore(jobs, profile) {
  const nonMatchingJobs = [];

  // get non matching jobs which have not been marked as show later within 12 hours
  for (const job of jobs) {
    job.matchScore = 0;

    for (const param of profile) {
      if (job[param.jobs_column] < param.min) {
        job.matchScore += param.min - job[param.jobs_column];
      } else if (job[param.jobs_column] > param.max) {
        job.matchScore += job[param.jobs_column] - param.max;
      }
    }
    nonMatchingJobs.push(job);
  }
  return nonMatchingJobs;
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
