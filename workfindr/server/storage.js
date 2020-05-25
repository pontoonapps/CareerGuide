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

async function swipedJobs(page, username) {
  // Make sure this works on likehistory and shortlist page
  const sql = await sqlPromise;
  // This is temporary as to get the id when we try out the queries. Getting the ID through their first_name isn't the final solution.
  const queryid =
  `SELECT id 
  FROM \`pontoonapps_jobseeker\`.\`users\` 
  WHERE first_name=?`;
  const [data] = await sql.query(sql.format(queryid), username);
  const id = JSON.parse(JSON.stringify(data))[0].id;

  // This could potentionally be merged into on SQL query later on
  let query = '';
  switch (page) {
    case '0':
      query =
        `SELECT j.* 
        FROM \`pontoonapps_workfindr2\`.\`jobs\` AS j 
        INNER JOIN \`pontoonapps_workfindr2\`.\`shortlists\` AS sl 
        ON j.id=sl.job_id  
        WHERE sl.user_id=?`;
      break;
    case '1':
      query =
        `SELECT j.*, li.type 
        FROM \`pontoonapps_workfindr2\`.\`jobs\` AS j
        INNER JOIN \`pontoonapps_workfindr2\`.\`likes\` AS li 
        ON j.id=li.job_id  
        WHERE li.user_id=?`;
      break;
  }
  const [rows] = await sql.query(sql.format(query), id);
  console.log(rows);
  return rows;
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

function refreshItemList() { // refresh Item List
  return jobs().jobs.concat(questions().questions);
}

module.exports = {
  jobs,
  questions,
  ansrdQuestns,
  swipedJobs,
  refreshItemList,
};
