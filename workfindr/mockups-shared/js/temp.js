// temp.js
// This is a temporary file that shows how we could handle the client side when receiving the data from the server.

// init globals
const data = getData(); // load mock data

function getData() {
  const data = {};
  data.jobs = {
    type: 'jobs',
    jobList: [{
      ID: '1',
      title: 'Plumber',
      description: 'Red dungarees and hat included',
      image: 'img/tempImage.png',
    }, {
      ID: '2',
      title: 'Programmer',
      description: 'Light up keyboard provided',
      image: 'img/tempImage.png',
    }, {
      ID: '3',
      title: 'Plumber',
      description: 'Light up keyboard provided',
      image: 'img/tempImage.png',
    }, {
      ID: '4',
      title: 'Programmer',
      description: 'Light up keyboard provided',
      image: 'img/tempImage.png',
    }, {
      ID: '5',
      title: 'Plumber',
      description: 'Light up keyboard provided',
      image: 'img/tempImage.png',
    }, {
      ID: '6',
      title: 'Programmer',
      description: 'Light up keyboard provided',
      image: 'img/tempImage.png',
    }, {
      ID: '7',
      title: 'Plumber',
      description: 'Light up keyboard provided',
      image: 'img/tempImage.png',
    }, {
      ID: '8',
      title: 'Programmer',
      description: 'Light up keyboard provided',
      image: 'img/tempImage.png',
    }],
  };

  data.questions = {
    type: 'questions',
    questions: [{
      ID: '1',
      title: 'Do you want to be a plumber?',
      answer: 'Yes',
      image: 'img/tempImage.png',
    }, {
      ID: '2',
      title: 'Do you want to be a programmer?',
      answer: null, // user has only answered up to question 1,
      image: 'img/tempImage.png',
    }],
  };

  data.swipedOnJobs = {
    jobs: [{
      ID: '1',
      title: 'Plumber',
      description: 'Red dungarees and hat included',
      swipe: 'liked',
      image: 'img/tempImage.png',
    }, {
      ID: '2',
      title: 'Programmer',
      description: 'Light up keyboard provided',
      swipe: 'disliked',
      image: 'img/tempImage.png',
    }, {
      ID: '3',
      title: 'Mechanic',
      description: 'Vroom vroom, im a car',
      swipe: 'liked',
      image: 'img/tempImage.png',
    }, {
      ID: '4',
      title: 'Programmer',
      description: 'This is an item with a longer description to check the size of the containers in the swipehistory page',
      swipe: 'disliked',
      image: 'img/tempImage.png',
    }],
  };

  data.questionnaireAnswers = {
    questions: [{
      ID: '1',
      question: 'Do you want to be a plumber?',
      answer: 'yes', // would true or false be more appropriate
      image: 'img/tempImage.png',
    }, {
      ID: '2',
      question: 'Do you want to be a programmer?',
      answer: 'no',
      image: 'img/tempImage.png',
    }, {
      ID: '3',
      question: 'Do you want to be a mechanic?',
      answer: 'no',
      image: 'img/tempImage.png',
    }],
  };

  data.shortlistedJobs = {
    jobs: [{
      ID: '2',
      title: 'Plumber',
      description: 'Red dungarees and hat included',
      image: 'img/tempImage.png',
    }, {
      ID: '1',
      title: 'Programmer',
      description: 'Light up keyboard provided',
      image: 'img/tempImage.png',
    }],
  };
  return data;
}

// display pages

// questionnaire review //

function loadQuestionnaireReview() {
  const elem = document.querySelector('#questionnaire-template');
  for (const question of data.questionnaireAnswers.questions) {
    const questionContainer = document.importNode(elem.content, true);
    questionContainer.querySelector('#questionnaireReviewTitle').textContent = question.question;
    if (question.answer !== null) {
      questionContainer.getElementById(question.answer).classList.add('selected');
    }
    const main = document.querySelector('main');
    main.appendChild(questionContainer);
  }
}

// swipe history //

function loadSwipeHistory() {
  const elem = document.querySelector('#swipe-history-temp');
  for (const job of data.swipedOnJobs.jobs) {
    const card = document.importNode(elem.content, true);

    card.querySelector('#swipeItemImg').setAttribute('src', job.image);
    card.querySelector('#swipeItemImg').setAttribute('alt', job.title + 'image');
    card.querySelector('#listItemTitle').textContent = job.title;
    card.querySelector('#swipeItemDesc').textContent = job.description;
    card.querySelector('#swipeChoice').classList.add(job.swipe);
    card.querySelector('#swipeChoice').textContent = (job.swipe === 'liked' ? '👍' : '👎');

    const main = document.querySelector('main');
    main.appendChild(card);
  }
}

function loadShortlist() {
  // TODO shortlist
}

// swipe page //

let jobItemIndex = 1; // global variable to move through jobs (TODO there must be a better way)
let jobsToSwipe = [];
const swipes = [];

function loadSwipePage() {
  jobsToSwipe = getJobs(jobsToSwipe); // get a list of jobs
  displayJobData(jobsToSwipe[0]); // display first job on page load

  // add event listener to like dislike and show later buttons
  // TODO create function for adding event listeners
  // TODO create function for adding handles
  document.querySelector('#btn-like').addEventListener('click', loadNextJob);
  document.querySelector('#btn-showLater').addEventListener('click', loadNextJob);
  document.querySelector('#btn-dislike').addEventListener('click', loadNextJob);
}

function loadNextJob() {
  const getMoreJobsAt = 1; // when to get more jobs (in this case when only 1 left)

  // add swipe choice to swipe array
  const swipe = {};
  swipe.type = event.target.textContent; // would a html attribute for swipe type be better
  swipe.job = jobsToSwipe[jobItemIndex].ID;
  swipes.push(swipe); // this would be sent to database to prevent jobs already swiped on being shown again

  // display next job
  displayJobData(jobsToSwipe[jobItemIndex]);
  jobItemIndex += 1;

  // if running low on jobs to swipe get more jobs
  if (jobItemIndex > jobsToSwipe.length - getMoreJobsAt) {
    getJobs(jobsToSwipe);
  }
}

function displayJobData(job) {
  document.querySelector('#title').textContent = job.title;
  document.querySelector('#info-text').textContent = job.description;
}

function getJobs(jobsArray) {
  const numJobsToAdd = 2; // in practice batches of 3 to 5 or 5 to 10 may be better
  const jobsSwiped = jobsArray.length; // used get jobs which haven't already been shown, in practice the server would keep track of this
  for (let i = 0; i < numJobsToAdd; i += 1) {
    jobsArray.push(data.jobs.jobList[jobsSwiped + i]);
  }
  return jobsArray;
}

// start script (after page has loaded)

function loadPage() {
  switch (document.querySelector('title').textContent) {
    case 'QuestionnaireReview':
      loadQuestionnaireReview();
      break;
    case 'SwipeHistory':
      loadSwipeHistory();
      break;
    case 'Shortlist':
      loadShortlist();
      break;
    case 'SwipePage':
      loadSwipePage();
      break;
  }
}

window.addEventListener('load', loadPage);
