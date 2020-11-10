import * as shared from './shared.js';

let currentItem; // job being displayed on page

async function getNextItem() {
  const response = await fetch('user/next-item');
  if (response.ok) {
    const item = await response.json();
    return item;
  }

  if (response.status === 401) {
    // not logged in, redirect to home page
    window.location = './';
  } else {
    console.log('Error from server: ' + response.status + '. Could not get next item');
  }
}

async function submitItem(event) {
  const delayPromise = shared.buttonDelay();
  const answer = {};
  answer.itemId = currentItem.id;
  answer.choice = event.target.dataset.choice;

  // show the button is active
  event.target.classList.add('active-wait');

  // identify whether current item is job or question is there a better
  // way than a lack of description? should there be an attribute marking job or question?
  let response;
  if (isQuestion(currentItem)) {
    response = await submitQuestionAnswer(answer);
  } else {
    response = await submitJobAnswer(answer);
  }

  await delayPromise;
  event.target.classList.remove('active-wait');

  // log if error connecting to server
  if (!response.ok) {
    document.querySelector('h1').textContent = 'Something went wrong! Please refresh';
    return false;
  }
  return true;
}

async function submitJobAnswer(answer) {
  const response = await fetch('user/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(answer),
  });
  return response;
}

async function submitQuestionAnswer(answer) {
  const response = await fetch('user/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(answer),
  });
  return response;
}

async function loadNextItem() {
  currentItem = await getNextItem();
  if (currentItem == null) {
    displayNoJobs();
  } else {
    displayItem(currentItem);
  }
}

function confirmShortlist() {
  const shortlistBtn = document.querySelector('#btn-shortlist');
  const submitShortlist = document.querySelector('#submit-shortlist');
  shortlistBtn.style.display = 'none';
  submitShortlist.style.display = '';
}

async function submitAndLoadNext(event) {
  if (await submitItem(event)) {
    loadNextItem();
    // Remove the property to make sure the window will collapse again
    // (only applies if the user has extended the window)
    document.documentElement.style.removeProperty('--next-job-height');
  }
}

function displayNoJobs() {
  const infoText = document.querySelector('#info-text');
  document.querySelector('#title').textContent = "That's all for now!";
  document.querySelector('#item-image').src = 'img/question.jpg';
  document.querySelector('#item-image').alt = 'question mark';

  infoText.textContent = ''; // TODO add french text for all jobs seen
  infoText.append(
    'Congratulations, you have now seen all the jobs in our system! ',
    'Check out your likes and dislikes at ',
    createLink('likehistory.html', 'the like history page'),
    ', or see ',
    createLink('shortlist.html', 'what you have shortlisted'),
    '.',
  );

  // set main grid height to auto so the text doesn't scroll
  document.documentElement.style.setProperty('--next-job-height', 'auto');

  for (const button of document.querySelectorAll('button')) {
    button.style.display = 'none';
  }
}

function createLink(href, textContent) {
  const linkEl = document.createElement('a');
  linkEl.href = href;
  linkEl.textContent = textContent;
  return linkEl;
}

function displayItem(item) {
  // hide buttons in <main> (only in <main> to skip language selector in <nav>)
  for (const button of document.querySelectorAll('main > button')) {
    button.style.display = 'none';
  }

  // display info shared by questions and jobs (image and title)
  const title = document.querySelector('#title');
  shared.bothLanguages(title, item.title_en, item.title_fr); // sets title text
  resizeTitle(); // shrinks title font size if overflowing
  // TODO the font size is changed for the text CURRENTLY in the title, changing lanuage
  // could cause the new text to be larger and therefore overflow. Should resizeTitle
  // be run again when changing language?

  const infoText = document.querySelector('#info-text');
  if (isQuestion(item)) {
    // item without description is a question

    // show option buttons and add option number to dataset
    let buttonIndex = 0;
    for (const option of item.options) {
      const button = document.querySelectorAll('.question')[buttonIndex];
      button.style.display = '';
      shared.bothLanguages(button, option.label_en, option.label_fr);
      button.dataset.choice = option.option_number;
      buttonIndex += 1;
    }

    shared.bothLanguages(infoText, item.question_en, item.question_fr);
    displayInfoText(item);

    // show question image
    document.querySelector('#item-image').src = 'img/question.jpg';
    document.querySelector('#item-image').alt = 'question mark';
  } else {
    // show job buttons
    for (const jobButton of document.querySelectorAll('.job')) {
      jobButton.style.display = '';
    }

    // show image
    document.querySelector('#item-image').src = 'img/' + item.image;
    document.querySelector('#item-image').alt = 'job icon';

    // show job description
    shared.bothLanguages(infoText, item.description_en, item.description_fr);
    displayInfoText(item);
  }
}

function isQuestion(item) {
  return item.description_en == null;
}

function displayInfoText(item) {
  const infoText = document.querySelector('#info-text');
  const showMore = document.querySelector('#show-more');

  infoText.classList.toggle('question-text', isQuestion(item));

  if (infoText.clientHeight < infoText.scrollHeight) {
    truncateOverflow(infoText);
    showMore.style.display = '';
  } else if (infoText.clientHeight >= infoText.scrollHeight) {
    showMore.style.display = 'none';
  }
}

function truncateOverflow(container) {
  let cutText = container.textContent;
  while (container.clientHeight < container.scrollHeight && cutText.length > 0) {
    cutText = cutText.slice(0, cutText.lastIndexOf(' ')); // remove last word so not cut mid word
    container.textContent = cutText;
  }
  cutText = cutText.slice(0, cutText.lastIndexOf(' '));
  cutText += '…';
  container.textContent = cutText;
}

function resizeTitle() {
  const titleEl = document.querySelector('#title');

  // set title then fontsize to 2em, if title overflows decrease font size until no overflow
  let fontEm = 2;
  let overflowing = true;
  document.documentElement.style.setProperty('--title-fontsize', `${fontEm}em`);
  while (overflowing === true && fontEm > 1) {
    fontEm -= 0.1;
    document.documentElement.style.setProperty('--title-fontsize', `${fontEm}em`);
    if (titleEl.clientHeight === titleEl.scrollHeight &&
      titleEl.clientWidth === titleEl.scrollWidth) {
      overflowing = false;
    }
  }
}

async function expandInfoText() {
  // set main grid height to auto
  document.documentElement.style.setProperty('--next-job-height', 'auto');
  await displayItem(currentItem); // hides show more button and un-truncates text
  // show show less button
  document.querySelector('#show-less').style.display = '';
}

async function collapseInfoText() {
  // set main grid height to default value
  document.documentElement.style.removeProperty('--next-job-height');
  await displayItem(currentItem); // hides show less button and re-truncates text
  // show show more button
  document.querySelector('#show-more').style.display = '';
}

function addEventListeners() {
  const submitButtonsSelector = `
    .question,
    #btn-dislike,
    #btn-show-later,
    #btn-like,
    #submit-shortlist`;

  for (const button of document.querySelectorAll(submitButtonsSelector)) {
    button.addEventListener('click', submitAndLoadNext);
  }

  document.querySelector('#btn-shortlist').addEventListener('click', confirmShortlist);
  document.querySelector('#show-more').addEventListener('click', expandInfoText);
  document.querySelector('#show-less').addEventListener('click', collapseInfoText);
  window.addEventListener('resize', () => { displayInfoText(currentItem); });

  document.addEventListener('language-changed', resizeTitle);
}

async function loadPage() {
  shared.showLoadingLabel();
  shared.initNavbar();
  await shared.checkLogin();
  addEventListeners();
  await loadNextItem();
  shared.hideLoadingLabel();

  // truncate info text and display show later button if required
  // info text will overflow if added while info text's display is none
  displayInfoText(currentItem);
}

window.addEventListener('load', loadPage);
