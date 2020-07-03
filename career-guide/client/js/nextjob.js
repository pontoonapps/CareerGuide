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

function timeoutDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const BUTTON_DELAY = 250;

async function submitItem(event) {
  const delayPromise = timeoutDelay(BUTTON_DELAY);
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

function displayNoJobs() {
  hideLoadingMessage();
  const infoText = document.querySelector('#info-text');
  document.querySelector('#title').textContent = "That's all for now!";
  document.querySelector('#item-image').src = 'img/question.jpg';
  document.querySelector('#item-image').alt = 'question image';

  infoText.textContent = '';
  infoText.append(
    'You have now seen all the recommended jobs that match your profile. ',
    'Check out your likes and dislikes at ',
    createLink('likehistory.html', 'the like history page'),
    ', or see ',
    createLink('shortlist.html', 'what you have shortlisted'),
    ', or you can tweak your ',
    createLink('questionnairereview.html', 'questionnaire answers'),
    ' to get new recommendations.',
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
  hideLoadingMessage();

  for (const button of document.querySelectorAll('button')) { // hide buttons
    button.style.display = 'none';
  }

  // display info shared by questions and jobs (image and title)
  displayTitle(item.title_en);

  if (isQuestion(item)) {
    // item without description is a question

    // show option buttons and add option number to dataset
    let buttonIndex = 0;
    for (const option of item.options) {
      const button = document.querySelectorAll('.question')[buttonIndex];
      button.style.display = '';
      button.textContent = option.label_en;
      button.dataset.choice = option.option_number;
      buttonIndex += 1;
    }
    displayInfoText(item);

    // show question image
    document.querySelector('#item-image').src = 'img/question.jpg';
    document.querySelector('#item-image').alt = 'question image';
  } else {
    // show job buttons
    for (const jobButton of document.querySelectorAll('.job')) {
      jobButton.style.display = '';
    }

    // show image
    document.querySelector('#item-image').src = 'img/' + item.image;
    document.querySelector('#item-image').alt = 'item image: ' + item.image;

    // show job description
    displayInfoText(item);
  }
}

function isQuestion(item) {
  return item.description_en == null;
}

function displayInfoText(item) {
  const infoText = document.querySelector('#info-text');
  const showMore = document.querySelector('#show-more');

  const text = isQuestion(item) ? item.question_en : item.description_en;
  infoText.textContent = text;

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

function displayTitle(titleText) {
  const titleEl = document.querySelector('#title');
  titleEl.textContent = titleText;

  // set title then fontsize to 2em, if title overflows decrease font size until no overflow
  let fontEm = 2;
  let overflowing = true;
  document.documentElement.style.setProperty('--title-fontsize', `${fontEm}em`);
  while (overflowing === true && fontEm > 0) {
    fontEm -= 0.1;
    document.documentElement.style.setProperty('--title-fontsize', `${fontEm}em`);
    if (titleEl.clientHeight === titleEl.scrollHeight && titleEl.clientWidth === titleEl.scrollWidth) {
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
  for (const button of document.querySelectorAll('.job, .question, #btn-shortlist')) {
    button.addEventListener('click', async () => {
      if (await submitItem(event)) {
        loadNextItem();

        // Remove the property to make sure the window will collapse again
        // (only applies if the user has extended the window)
        document.documentElement.style.removeProperty('--next-job-height');
      }
    });
  }
  document.querySelector('#show-more').addEventListener('click', expandInfoText);
  document.querySelector('#show-less').addEventListener('click', collapseInfoText);
  window.addEventListener('resize', () => { displayInfoText(currentItem); });
}

function hideLoadingMessage() {
  document.querySelector('#loadingLabel').style.display = 'none';
  document.querySelector('#title').style.display = '';
  document.querySelector('main').style.display = '';
}

// start script (after page has loaded)
function loadPage() {
  addEventListeners();
  loadNextItem();
}

window.addEventListener('load', loadPage);
