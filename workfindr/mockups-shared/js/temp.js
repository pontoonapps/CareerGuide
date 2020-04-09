// temp.js
// This is a temporary file that shows how we could handle the client side when receiving the data from the server.

// init globals
const data = getData(); // load mock data

function getData() {
  const data = {};
  data.jobs = {
    type: 'jobs',
    jobs: [{
      ID: '1',
      title: 'Plumber',
      description: 'Red dungarees and hat included',
      image: 'img/tempImage.png',
    }, {
      ID: '2',
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
  return 0; // Just to prevent undefined output in console.
}

function loadSwipeHistory() {
  const elem = document.querySelector('#swipe-history-temp');
  const history = data.swipedOnJobs; // Can put function that returns answers from database here
  history.jobs.forEach(job => {
    console.log(job);
    const card = document.importNode(elem.content, true);

    card.querySelector('#swipeItemImg').setAttribute('src', job.image);
    card.querySelector('#listItemTitle').textContent = job.title;
    card.querySelector('#swipeItemDesc').textContent = job.description;
    card.querySelector('#swipeChoice').classList.add(job.swipe);
    card.querySelector('#swipeChoice').textContent = (job.swipe === 'liked' ? '👍' : '👎');

    const main = document.getElementsByTagName('main')[0];
    main.appendChild(card);
  });
  return 0; // Just to prevent undefined output in console.
}

function loadShortlist() {
  // TODO: Swipe Page
  return 0; // Just to prevent undefined output in console.
}

function loadSwipePage() {

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
