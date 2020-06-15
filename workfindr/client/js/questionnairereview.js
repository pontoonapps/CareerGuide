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
  const template = document.querySelector('#questionnaire-template');
  const questions = await getQuestReview();
  for (const question of questions) {
    const questionContainer = document.importNode(template.content, true);

    // fill in template with question data
    questionContainer.querySelector('.question-title').textContent = question.question_en;
    let buttonIndex = 0;
    for (const option of question.options) {
      const btn = questionContainer.querySelectorAll('.question-answer div')[buttonIndex];
      btn.style.display = '';
      btn.textContent = option.answer_en;
      btn.dataset.choice = option.answer_number;
      if (option.answer_number === question.answer_number) {
        btn.classList.add('selected');
      }
      buttonIndex += 1;
    }

    // add event listeners and data attributes
    for (const questionAnswer of questionContainer.querySelectorAll('.question-answer div')) {
      questionAnswer.dataset.questionId = question.question_id;
      questionAnswer.addEventListener('click', updateAns);
    }

    // append to main
    const main = document.querySelector('main');
    main.appendChild(questionContainer);
  }
  if (questions.length === 0) {
    const empty = document.querySelector('#empty-page');
    empty.style.display = '';
  }
}

async function updateAns() {
  const questAns = event.target;
  if (questAns.classList[1] !== 'selected') { // if item clicked is already selected no need to change answer
    const succSubmit = await submitAnsChange(event);
    if (succSubmit) {
      const parent = questAns.parentNode;
      parent.querySelector('.selected').classList.remove('selected');
      questAns.classList.add('selected');
    }
  }
}

async function submitAnsChange(event) {
  const userInput = {};
  userInput.choice = event.target.dataset.choice;
  userInput.itemId = event.target.dataset.questionId;

  // submit question answer change to server
  const response = await submitChange(userInput);

  if (response.ok) {
    return response.ok;
  } else {
    console.log('Error from server:  ' + response.statusText + '. Could not submit answer change.');
  }
}

async function submitChange(userInput) {
  const response = await fetch('user/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userInput),
  });
  return response;
}

async function checkLogin() {
  const reponse = await fetch('user/');
  if (reponse.status === 401) {
    window.location = './';
  }
}

function loadPage() {
  checkLogin();
  loadQuestReview();
}

window.addEventListener('load', loadPage);
