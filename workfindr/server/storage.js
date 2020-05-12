// storage.js
// swipe page data

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
    }],
  };

  return testJobs;
}

function swipedJobs() {
  const testJobs = {
    jobs: [{
      id: 0,
      title: 'Plumber',
      description: 'You will  fits and repair the pipe, fitting, and other apparatus of water supply, sanitation, or heating systems.',
      image: 'img/property.jpg',
      swipe: 'disliked',
      shortlisted: 'true',
    }, {
      id: 1,
      title: 'Programmer',
      description: 'You will write computer programs',
      image: 'img/it.jpg',
      swipe: 'liked',
      shortlisted: 'false',
    }, {
      id: 2,
      title: 'Media Sales Executive',
      description: 'You will sell advertising space in newspapers and magazines, online publications, radio and television, outdoor billboards and digital screens. You will approach potential customers to make sales, work to reach targets and deliver sales reports to management.',
      image: 'img/retail.jpg',
      swipe: 'liked',
      shortlisted: 'false',
    }, {
      id: 3,
      title: 'Educational Support Assistants',
      description: 'You will be working closely with teachers and other staff involved in the education system and provide a general support role for the pupils in the school.',
      image: 'img/education.jpg',
      swipe: 'disliked',
      shortlisted: 'true',
    }, {
      id: 4,
      title: 'Accountant',
      description: 'Accounting technicians work for both private and public sector organisations, where they undertake a wide range of accountancy, financial and taxation tasks.',
      image: 'img/financial.jpg',
      swipe: 'liked',
      shortlisted: 'true',
    }],
  };

  return testJobs;
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
