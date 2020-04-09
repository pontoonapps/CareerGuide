// temp.js
// This is a temporary file that shows how we could handle the client side when receiving the data from the server.

const jobs = {
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

const questions = {
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

const swipedOnJobs = {
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

const questionnaireAnswers = {
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

const shortlistedJobs = {
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

function loadQReview() {
  const elem = document.querySelector('#questionnaire-temp');
  const answers = questionnaireAnswers; // Can put function that returns answers from database here
  answers.questions.forEach(question => {
    console.log(question);
    const card = document.importNode(elem.content, true);

    // card.getElementById('img').setAttribute('src', question.image);
    card.getElementById('questionnaireReviewTitle').textContent = question.question;

    if (question.answer !== null) {
      card.getElementById(question.answer).classList.add('selected');
    }

    const main = document.getElementsByTagName('main')[0];
    main.appendChild(card);
  });
  return 0; // Just to prevent undefined output in console.
}

function loadSHistory() {
  const elem = document.querySelector('#swipe-history-temp');
  const history = swipedOnJobs; // Can put function that returns answers from database here
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

function loadSList() {
  // TODO: Swipe Page
  return 0; // Just to prevent undefined output in console.
}

function loadSPage() {

}

function setText(elem, id, data) {
  elem.getElementById(id).textContent = data;
}
