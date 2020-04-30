// questionnaireReview.js

async function getQReview() {
  const response = await fetch('/user/questions');

  if (response.ok) {
    const qList = await response.json();
    return qList.questions;
  } else {
    console.log('error', response.status, 'could not get question history');
  }
}

async function loadQReview() {
  const tmplt = document.querySelector('#questionnaire-template');
  const questns = await getQReview();
  for (const quest of questns) {
    // get question container template
    const questCont = document.importNode(tmplt.content, true); // question container

    // fill in template with question data
    questCont.querySelector('.questionnaireReviewTitle').textContent = quest.question;
    if (quest.answer !== null) {
      questCont.querySelector('.' + quest.answer).classList.add('selected');
    }

    // add event listeners and data attributes
    for (const questAns of questCont.querySelectorAll('.questionnaireAnswer')) {
      questAns.dataset.questid = quest.id;
      questAns.addEventListener('click', updateAns);
    }

    // append to main
    const main = document.querySelector('main');
    main.appendChild(questCont);
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
  const usrInput = {};
  usrInput.itemid = event.target.parentNode.dataset.questid;
  // switch statement used so choice name is independent of class name (right now they are the same)
  switch (event.target.classList[0]) {
    case 'yes':
      usrInput.choice = 'yes';
      break;
    case 'no':
      usrInput.choice = 'no';
      break;
  }
  const response = await submitChange(usrInput);

  if (!response.ok) {
    console.log('error', response.statusText, 'cant change');
  }
  return (response.ok);
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
  loadQReview();
}

window.addEventListener('load', loadPage);
