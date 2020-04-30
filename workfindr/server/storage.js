// storage.js
// swipe page data

function jobs() {
  const testJobs = {
    jobs: [{
      id: 0,
      title: 'Plumber',
      description: 'Red dungarees and hat included',
      image: 'img/tempimage.png',
    }, {
      id: 1,
      title: 'Programmer',
      description: 'Light up keyboard provided',
      image: 'img/tempimage.png',
    }, {
      id: 2,
      title: 'Con artist',
      description: 'Steals your valuable possessions',
      image: 'img/tempimage.png',
    }, {
      id: 3,
      title: 'Teacher',
      description: '"Might" teach you things',
      image: 'img/tempimage.png',
    }],
  };

  return testJobs;
}

function swipedJobs() {
  const testJobs = {
    jobs: [{
      id: 0,
      title: 'Plumber',
      description: 'Red dungarees and hat included',
      image: 'img/tempimage.png',
      swipe: 'disliked',
      shortlisted: 'true',
    }, {
      id: 1,
      title: 'Programmer',
      description: 'Light up keyboard provided',
      image: 'img/tempimage.png',
      swipe: 'liked',
      shortlisted: 'false',
    }, {
      id: 2,
      title: 'Con artist',
      description: 'Steals your valuable possessions',
      image: 'img/tempimage.png',
      swipe: 'liked',
      shortlisted: 'false',
    }, {
      id: 3,
      title: 'Teacher',
      description: '"Might" teach you things',
      image: 'img/tempimage.png',
      swipe: 'disliked',
      shortlisted: 'true',
    }, {
      id: 4,
      title: 'Rocket engineer',
      description: 'Makes rockets',
      image: 'img/tempimage.png',
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
      image: 'img/tempimage.png',
    }, {
      id: 1,
      title: 'Are you good with computers?',
      image: 'img/tempimage.png',
    }, {
      id: 2,
      title: 'Can you make 10+ cups of tea?',
      image: 'img/tempimage.png',
    }, {
      id: 3,
      title: 'Can you play guitar?',
      image: 'img/tempimage.png',
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
