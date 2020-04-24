// storage.js
// swipe page data

function testJobs() {
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

function testSwipedJobs() { // test swiped jobs
  const testJobs = {
    jobs: [{
      id: 0,
      title: 'Plumber',
      description: 'Red dungarees and hat included',
      image: 'img/tempimage.png',
      swipe: 'disliked',
    }, {
      id: 1,
      title: 'Programmer',
      description: 'Light up keyboard provided',
      image: 'img/tempimage.png',
      swipe: 'liked',
    }, {
      id: 2,
      title: 'Con artist',
      description: 'Steals your valuable possessions',
      image: 'img/tempimage.png',
      swipe: 'liked',
    }, {
      id: 3,
      title: 'Teacher',
      description: '"Might" teach you things',
      image: 'img/tempimage.png',
      swipe: 'disliked',
    }],
  };

  return testJobs;
}

function testQuestions() {
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
      title: 'Can you make 10+ cups of tea in one go?',
      image: 'img/tempimage.png',
    }, {
      id: 3,
      title: 'Can you play guitar?',
      image: 'img/tempimage.png',
    }],
  };

  return questions;
}

function testAnsrdQuestns() { // test Answered Questions
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

function slistJobs() {
  const slistJobs = {
    jobs: [{
      id: 0,
      title: 'Teacher',
      description: 'Can teach you how to do "X"',
      image: 'img/tempimage.png',
    }, {
      id: 1,
      title: 'Plumber',
      description: 'Knows things about plumbing',
      image: 'img/tempimage.png',
    }, {
      id: 2,
      title: 'Priest',
      description: 'Likes god',
      image: 'img/tempimage.png',
    }],
  };

  return slistJobs;
}

function refreshItemList() { // refresh Item List
  return testJobs().jobs.concat(testQuestions().questions);
}

module.exports = {
  testJobs,
  testQuestions,
  testAnsrdQuestns,
  testSwipedJobs,
  slistJobs,
  refreshItemList,
};
