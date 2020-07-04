async function getQuestionnaireAnswers() {
  const response = await fetch('user/questions');

  if (response.ok) {
    const qList = await response.json();
    return qList;
  }

  if (response.status === 401) {
    // not logged in, redirect to home page
    window.location = './';
  } else {
    console.log('Error from server: ' + response.status + '. Could not get question history');
  }
  return [];
}

async function loadQuestionnaireAnswers() {
  const template = document.querySelector('#questionnaire-template');
  const questions = await getQuestionnaireAnswers();

  const empty = document.querySelector('#empty-page');

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

    empty.style.display = 'none';
  }
}

function timeoutDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateAns() {
  const questionAnswer = event.target;
  const toast = document.querySelector('#toast');
  // change answer if new answer is not the same as previous and toast is not being displayed
  if (questionAnswer.classList[1] !== 'selected' && toast.style.display === 'none') {
    const success = await submitAnswerChange(event);
    if (success) {
      await timeoutDelay(100);
      // un-highlight old answer and highlight new answer
      const parent = questionAnswer.parentNode;
      parent.querySelector('.selected').classList.remove('selected');
      questionAnswer.classList.add('selected');

      // display toast
      toast.style.display = '';
      await timeoutDelay(1500);
      toast.style.display = 'none';
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
  await loadQuestionnaireAnswers();

  // hide loading label and show main
  document.querySelector('main').style.display = '';
  document.querySelector('#loadingLabel').style.display = 'none';
}

window.addEventListener('load', loadPage);
