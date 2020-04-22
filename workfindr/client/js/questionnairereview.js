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
  const answrList = await getQReview();
  for (const q of answrList) {
    const cont = document.importNode(tmplt.content, true);

    cont.querySelector('.questionnaireReviewTitle').textContent = q.question;
    if (q.answer !== null) {
      cont.querySelector('.' + q.answer).classList.add('selected');
    }
    const main = document.querySelector('main');
    main.appendChild(cont);
  }
}

function loadPage() {
  loadQReview();
}

window.addEventListener('load', loadPage);
