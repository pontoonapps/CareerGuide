import * as shared from './shared.js';

async function getQuestionnaireAnswers() {
  const response = await fetch('user/questions');

  if (response.ok) {
    const questionList = await response.json();
    return questionList;
  }

  if (response.status === 401) {
    // not logged in, redirect to home page
    window.location = './';
  } else {
    console.log('Error from server: ' + response.status + '. Could not get question history');
    shared.errorTitle();
  }
  return [];
}

async function loadQuestionnaireAnswers() {
  const template = document.querySelector('#questionnaire-template');
  const questions = await getQuestionnaireAnswers();

  const emptyPageWarning = document.querySelector('#empty-page');

  for (const question of questions) {
    const questionContainer = document.importNode(template.content, true);

    // fill in template with question data
    const questionTitle = questionContainer.querySelector('.question-title');
    shared.bothLanguages(questionTitle, question.question_en, question.question_fr);
    let buttonIndex = 0;
    for (const option of question.options) {
      const btn = questionContainer.querySelectorAll('.question-answer button')[buttonIndex];
      btn.style.display = '';
      // btn.textContent = option.answer_en;
      shared.bothLanguages(btn, option.answer_en, option.answer_fr);
      btn.dataset.choice = option.answer_number;
      if (option.answer_number === question.answer_number) {
        btn.classList.add('selected');
      }
      buttonIndex += 1;
    }

    // add event listeners and data attributes
    for (const questionAnswer of questionContainer.querySelectorAll('.question-answer button')) {
      questionAnswer.dataset.questionId = question.question_id;
      questionAnswer.addEventListener('click', updateAnswer);
    }

    // append to main
    const main = document.querySelector('main');
    main.appendChild(questionContainer);

    emptyPageWarning.style.display = 'none';
  }
}

async function updateAnswer() {
  const questionAnswer = event.target;

  // change answer if new answer is not the same as previous and toast is not being displayed
  if (questionAnswer.classList[1] !== 'selected') {
    const success = await submitAnswerChange(event);
    if (success) {
      shared.createToast();
      // un-highlight old answer and highlight new answer
      const parent = questionAnswer.parentNode;
      parent.querySelector('.selected').classList.remove('selected');
      questionAnswer.classList.add('selected');
    }
  }
}

async function submitAnswerChange(event) {
  const userInput = {};
  userInput.choice = event.target.dataset.choice;
  userInput.itemId = event.target.dataset.questionId;

  // submit question answer change to server
  const response = await submitChange(userInput);

  if (response.ok) {
    return response.ok;
  } else {
    console.log('Error from server:  ' + response.statusText + '. Could not submit answer change.');
    shared.errorTitle();
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

async function loadPage() {
  shared.showLoadingLabel();
  shared.initNavbar();
  await shared.checkLogin();
  await loadQuestionnaireAnswers();
  shared.hideLoadingLabel();
}

window.addEventListener('load', loadPage);
