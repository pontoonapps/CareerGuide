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
      shortlists.job_id AS shortlist,
      likes.time_stamp AS timestamp
    FROM pontoonapps_careerguide.jobs
    JOIN pontoonapps_careerguide.categories
      ON pontoonapps_careerguide.jobs.category_id = pontoonapps_careerguide.categories.id
    JOIN pontoonapps_careerguide.likes
      ON pontoonapps_careerguide.jobs.id = pontoonapps_careerguide.likes.job_id
    LEFT JOIN pontoonapps_careerguide.shortlists
      ON pontoonapps_careerguide.likes.job_id = pontoonapps_careerguide.shortlists.job_id
     AND pontoonapps_careerguide.likes.user_id = pontoonapps_careerguide.shortlists.user_id
    WHERE pontoonapps_careerguide.likes.user_id = ?
    ORDER BY likes.time_stamp DESC`;

  const [answeredJobs] = await sql.query(query, userId);
  return answeredJobs;
}

async function answeredQuestions(userId) {
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
        title_fr: row.title_fr,
        question_en: row.question_en,
        question_fr: row.question_fr,
        answer_number: row.answered,
        options: options,
      });
    }
    // TODO: Add french translation to answer_fr
    // push the current question's option data
    options.push({
      answer_en: row.answer_en,
      answer_fr: row.answer_fr,
      answer_number: row.answer_number });
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

  // select from jobs which most closely match user's profile
  const jobsNotSeenRecently = freshJobs.filter(job => !job.timeStampRecent);
  scoreJobs(jobsNotSeenRecently, profile);

  if (jobsNotSeenRecently.length > 0) {
    const lowestScore = jobsNotSeenRecently[0].matchScore;
    const closestMatches = jobsNotSeenRecently.filter(job => job.matchScore === lowestScore);
    const nextJob = getPseudoRandomItem(closestMatches);
    return formatNextJobForAPI(nextJob);
  }

  // if we run out of jobs that have not been shown recently,
  // get jobs marked as "show later" less than 12 hours ago
  // (sorted by sql in order the user has seen the jobs)
  const recentShowLater = freshJobs.filter(job => job.timeStampRecent);

  if (recentShowLater.length > 0) {
    return formatNextJobForAPI(recentShowLater[0]);
  }

  return null;
}

// extract only job properties that the API needs to return
function formatNextJobForAPI(job) {
  return {
    id: job.id,
    title_en: job.title_en,
    title_fr: job.title_fr,
    description_en: job.description_en,
    description_fr: job.description_fr,
    image: job.image,
  };
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

  // TODO should be title not titre
  const query = `
    SELECT
      jobs.id,
      jobs.title_en,
      jobs.titre_fr AS title_fr,
      jobs.description_en,
      jobs.description_fr,
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
    ORDER BY likes.time_stamp ASC, jobs.id ASC`;

  const [jobs] = await sql.query(query, userId);
  return jobs;
}

function scoreJobs(jobs, profile) {
  for (const job of jobs) {
    job.matchScore = 0;
    for (const param of profile) {
      const jobParam = job[param.jobs_column];
      if (jobParam < param.min) {
        job.matchScore += param.min - jobParam;
      } else if (jobParam > param.max) {
        job.matchScore += jobParam - param.max;
      }
    }
  }

  // sort jobs from best to worst match
  jobs.sort((a, b) => (a.matchScore - b.matchScore));
}

async function getQuestionnaireProfile(userId) {
  const sql = await sqlPromise;

  const query = `
    SELECT jobs_column, min, max
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
      questions.title_fr AS title_fr,
      questions.question_en AS question_en,
      questions.question_fr AS question_fr,
      options.label_en AS answer_en,
      options.label_fr AS answer_fr,
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

  console.log(questionData);
  if (questionData[0] === undefined) {
    return;
  }

  // aggregate the options
  const options = [];
  for (const row of questionData) {
    options.push({
      label_en: row.answer_en,
      label_fr: row.answer_fr,
      option_number: row.answer_number,
    });
  }

  const question = {
    id: questionData[0].question_id,
    options: options,
    question_en: questionData[0].question_en,
    question_fr: questionData[0].question_fr,
    title_en: questionData[0].title_en,
    title_fr: questionData[0].title_fr,
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

  await updateUserMtime(ansData.userId);
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

  await updateUserMtime(jobData.userId);
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

  await updateUserMtime(jobData.userId);
}

async function removeShortlist(jobData) {
  const sql = await sqlPromise;

  const query = `
    DELETE FROM pontoonapps_careerguide.shortlists
    WHERE user_id = ?
    AND   job_id = ?`;

  await sql.query(query, [jobData.userId, jobData.itemId]);

  await updateUserMtime(jobData.userId);
}

async function getUserIdForPontoonUser(pontoonId) {
  const sql = await sqlPromise;

  const read = `
    SELECT
      id
    FROM pontoonapps_careerguide.users
    WHERE pontoon_user_id = ?`;

  const [rows] = await sql.query(read, pontoonId);

  if (rows.length > 0) return rows[0].id;
  else return null;
}

async function registerPontoonUser(pontoonId, guestId) {
  if (guestId != null) return registerGuestAsPontoonUser(pontoonId, guestId);

  const sql = await sqlPromise;

  // register the user first
  // INSERT IGNORE will be a noop if the user is already there
  const query = `
    INSERT IGNORE
    INTO pontoonapps_careerguide.users(pontoon_user_id)
    VALUES (?)`;

  await sql.query(query, pontoonId);

  // return the (new) ID for the user
  const id = await getUserIdForPontoonUser(pontoonId);
  console.log(`registered pontoon user ${pontoonId} as ${id}`);

  return id;
}

async function registerGuestAsPontoonUser(pontoonId, guestId) {
  const sql = await sqlPromise;

  const query = `
    UPDATE pontoonapps_careerguide.users
    SET pontoon_user_id = ?
    WHERE id = ?`;

  await sql.query(query, [pontoonId, guestId]);

  console.log(`registered pontoon user ${pontoonId} as formerly guest ${guestId}`);
  return guestId;
}

async function getUserInfoForGuestUser(name) {
  const sql = await sqlPromise;

  const read = `
    SELECT
      id,
      pontoon_user_id
    FROM pontoonapps_careerguide.users
    WHERE guest_name = ?`;

  const [rows] = await sql.query(read, name);

  if (rows.length > 0) {
    return {
      id: rows[0].id,
      pontoonId: rows[0].pontoon_user_id,
    };
  } else {
    return null;
  }
}


async function updateUserMtime(userId) {
  const sql = await sqlPromise;

  const query = `
    UPDATE pontoonapps_careerguide.users
    SET date_modified = CURRENT_TIMESTAMP()
    WHERE
      id = ?`;

  await sql.query(query, userId);
}

const MAX_TRIES = 3;
async function createGuestUser() {
  const sql = await sqlPromise;

  let done;
  let tries = 0;

  while (done == null && tries < MAX_TRIES) {
    tries += 1;
    try {
      const newId = Math.trunc(Math.random() * Number.MAX_SAFE_INTEGER);

      // try registering the user, will fail if the random name already exists
      const query = `
        INSERT INTO pontoonapps_careerguide.users(guest_name)
        VALUES (?)`;

      await sql.query(query, newId);

      // if the query succeeds, return the new ID
      done = newId;
    } catch (e) {
      if (e.code !== 'ER_DUP_ENTRY' || tries >= MAX_TRIES) {
        console.error(e);
        throw e;
      }
    }
  }

  // return the (new) ID for the user
  console.log(`registered guest user ${done}`);
  return done;
}

module.exports = {
  answeredQuestions,
  answeredJobs,
  getItem,
  insertQuestionAnswer,
  insertChoice,
  insertShortlist,
  removeShortlist,
  getUserIdForPontoonUser,
  registerPontoonUser,
  getUserInfoForGuestUser,
  createGuestUser,
};
