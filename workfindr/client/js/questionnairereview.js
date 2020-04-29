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
    for (const node of questCont.querySelectorAll('.questionnaireAnswer')) {
      node.setAttribute('questid', quest.id); // TODO use dataspace instead of attribute
      node.addEventListener('click', updateAns); // TODO better variable name than node
    }

    // append to main
    const main = document.querySelector('main');
    main.appendChild(questCont);
  }
}

function updateAns() {
  if (event.target.classList[1] !== 'selected') { // if item clicked is already selected no need to change answer
    const succSub = subAnsChange(event); // FIXME should this be await? cannot pass event to change ans when await
    if (succSub) {
      changeAns(event);
    } else {
      // TODO report error to user
    }
  }
}

function changeAns(event) {
  const answerCont = event.target.parentNode;
  for (const node of answerCont.childNodes) {
    if (node.classList !== undefined) {
      (node.classList[1] !== undefined)
        ? node.classList.remove('selected')
        : node.classList.add('selected');
    }
  }
}

async function subAnsChange(event) {
  const usrInput = {};
  usrInput.questid = event.target.parentNode.getAttribute('questid');
  // TODO is this switch required when the choice is the same as the class name?
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

async function submitChange(usrInput) { // TODO This is the same function as submitJInput on swipePage, repeated code??
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
