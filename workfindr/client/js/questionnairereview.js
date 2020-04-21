// questionnaireReview.js

const data = {
  questions: [{
    id: 0,
    question: 'Do you want to be a plumber?',
    answer: 'yes',
    image: 'img/tempImage.png',
  }, {
    id: 1,
    question: 'Do you want to be a programmer?',
    answer: 'no',
    image: 'img/tempImage.png',
  }, {
    id: 2,
    question: 'Do you want to be a mechanic?',
    answer: 'yes',
    image: 'img/tempImage.png',
  }],
};

function loadQReview(answrs) {
  const tmplt = document.querySelector('#questionnaire-template');
  for (const question of answrs.questions) {
    const cont = document.importNode(tmplt.content, true);

    cont.querySelector('.questionnaireReviewTitle').textContent = question.question;
    if (question.answer !== null) {
      cont.querySelector('.' + question.answer).classList.add('selected');
    }
    const main = document.querySelector('main');
    main.appendChild(cont);
  }
}

function loadPage() {
  loadQReview(data);
}

window.addEventListener('load', loadPage);
