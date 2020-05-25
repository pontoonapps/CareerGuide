const mysql = require('mysql2/promise');
const config = require('./config');

const sqlPromise = mysql.createConnection(config.mysql);

function jobs() {
  const testJobs = {
    jobs: [{
      id: 0,
      title: 'Plumber',
      description: 'You will  fits and repair the pipe, fitting, and other apparatus of water supply, sanitation, or heating systems.',
      image: 'img/property.jpg',
    }, {
      id: 1,
      title: 'Programmer',
      description: 'You will write computer programs',
      image: 'img/it.jpg',
    }, {
      id: 2,
      title: 'Media Sales Executive',
      description: 'You will sell advertising space in newspapers and magazines, online publications, radio and television, outdoor billboards and digital screens. You will approach potential customers to make sales, work to reach targets and deliver sales reports to management.',
      image: 'img/retail.jpg',
    }, {
      id: 3,
      title: 'Educational Support Assistants',
      description: 'You will be working closely with teachers and other staff involved in the education system and provide a general support role for the pupils in the school.',
      image: 'img/education.jpg',
    }, {
      id: 4,
      title: 'Accountant',
      description: 'Accounting technicians work for both private and public sector organisations, where they undertake a wide range of accountancy, financial and taxation tasks.',
      image: 'img/financial.jpg',
    }, {
      id: 5,
      title: 'Animal Nutritionist',
      description: '"As an animal nurtitionist you will research and evaluate the animals needs and design the diets of the animals in question.',
      image: 'img/cater.jpg',
    }, {
      id: 6,
      title: 'Art Therapist',
      description: 'Art therapy is the incorporation of art making into a patients counselling sessions to help both adults and children of all ages with their mental, physical and emotional health. As an art therapist you will use art therapy to treat stress, depression, low self esteem, behavioral problems and to resolve conflict.',
      image: 'img/art.jpg',
    },
    {
      id: 7,
      title: 'Text Length Test',
      description: 'Cheesecake chocolate sesame snaps. Wafer halvah lollipop danish oat cake cake chocolate gingerbread. Bear claw marzipan wafer icing gummi bears chupa chups halvah tart toffee. Halvah tiramisu cake gingerbread toffee. Brownie chocolate cookie cookie dessert chocolate bar croissant lollipop. Cake gummi bears pudding. Cake tootsie roll chocolate ice cream gummi bears. Biscuit pudding chocolate bar marzipan muffin gummi bears. Croissant bonbon chocolate cake cupcake sweet roll. Jujubes tart lollipop. Cake sweet cheesecake pie tiramisu toffee. Lemon drops muffin jelly-o pastry soufflé marzipan marshmallow. Danish tart gingerbread carrot cake chocolate cake chocolate cake tootsie roll. Tiramisu cookie candy pudding. Gummi bears icing croissant muffin lollipop croissant. Gummies sweet pastry. Lollipop chocolate cake apple pie oat cake tootsie roll brownie. Brownie sugar plum candy canes cake lemon drops oat cake brownie. Tiramisu pudding tiramisu jelly-o. Chocolate topping muffin bonbon oat cake muffin carrot cake. Lemon drops wafer liquorice cake biscuit icing tiramisu dessert. Carrot cake oat cake apple pie tart liquorice jujubes. Carrot cake chupa chups cake sugar plum gummi bears pastry pastry cheesecake. Cookie danish marzipan soufflé cupcake topping cake. Caramels gummies brownie. Halvah sugar plum gingerbread fruitcake jelly beans icing lemon drops macaroon gummies.',
      image: 'img/property.jpg',
    }],
  };

  return testJobs;
}

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

function ansrdQuestns() { // test Answered Questions
  const questions = {
    questions: [{
      id: 0,
      question: 'Do you want to be a plumber?',
      answer: 'yes',
      image: 'img/tempImage.png',
    }, {
      id: 1,
      question: 'Do you want to be a programmer?',
      answer: 'no',
      image: 'img/tempImage.png',
    }, {
      id: 2,
      question: 'Do you want to be a mechanic?',
      answer: 'yes',
      image: 'img/tempImage.png',
    }],
  };

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
    // There's no reason to use JSON.parse(JSON.stringify) here, removed it
    return rawJob;
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

module.exports = {
  jobs,
  questions,
  ansrdQuestns,
  swipedJobs,
  getSwipeItem,
  getUserID,
};
