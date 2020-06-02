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
      if (question.options.length < 3) {
        questionContainer.querySelector('.opt-3').style.display = 'none';
      }
      for (let i = 0; i < question.options.length; i++) {
        const btn = questionContainer.querySelector('.opt-' + (i + 1));
        btn.textContent = question.options[i].label_en;
        btn.dataset.choice = question.options[i].option_number;
        if (question.options[i].label_en === question.answer) {
          btn.classList.add('selected');
        }
      }
    }

    // add event listeners and data attributes
    for (const questionAnswer of questionContainer.querySelectorAll('.quest-ans')) {
      questionAnswer.dataset.questionId = question.id;
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
  userInput.itemId = event.target.parentNode.dataset.questionId;

  // submit question answer change to server
  const response = await submitChange(userInput);

  if (response.ok) {
    return response.ok;
  } else {
    console.log('Error from server:  ' + response.statusText + '. Could not submit answer change.');
  }
}

async function submitChange(userInput) {
  const response = await fetch('/user/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userInput),
  });
  return response;
}

function loadPage() {
  loadQuestReview();
}

window.addEventListener('load', loadPage);
