async function getQuestReview() {
  const response = await fetch('user/questions');

  if (response.ok) {
    const qList = await response.json();
    return qList;
  } else {
    console.log('Error from server: ' + response.status + '. Could not get questionnaire review');
  }
}

async function loadQuestReview() {
  const tmplt = document.querySelector('#questionnaire-template');
  const questions = await getQuestReview();
  for (const question of questions) {
    // get question container template
    const questionContainer = document.importNode(tmplt.content, true); // question container

    // fill in template with question data
    questionContainer.querySelector('.quest-rev-title').textContent = question.question;
    if (question.answer !== null) {
      questionContainer.querySelector('.' + question.answer).classList.add('selected');
    }

    // add event listeners and data attributes
    for (const questionAnswer of questionContainer.querySelectorAll('.quest-ans')) {
      questionAnswer.dataset.questId = question.id;
      questionAnswer.addEventListener('click', updateAns);
    }

    // append to main
    const main = document.querySelector('main');
    main.appendChild(questionContainer);
  }
}

async function updateAns() {
  const questAns = event.target;
  if (questAns.classList[1] !== 'selected') { // if item clicked is already selected no need to change answer
    const succSub = await subAnsChange(event);
    if (succSub) {
      changeAns(questAns);
    } else {
      document.querySelector('h1').textContent = 'Something went wrong! Please refresh';
    }
  }
}

function changeAns(questAns) {
  const answerCont = questAns.parentNode;
  for (const questAns of answerCont.childNodes) {
    if (questAns.classList !== undefined) {
      (questAns.classList[1] === 'selected')
        ? questAns.classList.remove('selected')
        : questAns.classList.add('selected');
    }
  }
}

async function subAnsChange(event) {
  // get required DOM elements
  const questAns = event.target;
  const answerCont = questAns.parentNode;

  // get current choice
  const currChoice = questAns.classList[0] === 'yes' ? 'yes' : 'no';

  // get job id and user choice
  const usrInput = {};
  usrInput.itemId = answerCont.dataset.questId;

  switch (currChoice) {
    case 'yes':
      usrInput.choice = 'yes';
      break;
    case 'no':
      usrInput.choice = 'no';
      break;
  }

  // submit question answer change to server
  const response = await submitChange(usrInput);

  if (response.ok) {
    return response.ok;
  } else {
    console.log('Error from server:  ' + response.statusText + '. Could not submit answer change.');
  }
}

async function submitChange(usrInput) {
  const response = await fetch('/user/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(usrInput),
  });
  return response;
}

function loadPage() {
  loadQuestReview();
}

window.addEventListener('load', loadPage);
