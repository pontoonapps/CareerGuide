import * as shared from './shared.js';

async function getLikeHistory() {
  const response = await fetch('user/jobs');

  if (response.ok) {
    const jobList = await response.json();
    return jobList;
  }

  if (response.status === 401) {
    // not logged in, redirect to home page
    window.location = './';
  } else {
    console.log('Error from server: ' + response.status + '. Could not get like history');
  }
  return [];
}

function displayLikeHistory(jobList) {
  const template = document.querySelector('#like-history-template');
  const listContainer = document.querySelector('#list-container');
  for (const job of jobList) {
    if (job.answer === 'show later') continue;

    const jobContainer = document.importNode(template.content, true);

    // display job data
    jobContainer.querySelector('.job-image').src = 'img/' + job.image;
    jobContainer.querySelector('.job-image').alt = job.title_en + 'image';
    jobContainer.querySelector('.list-item-title').textContent = job.title_en;
    jobContainer.querySelector('.job-desc').textContent = job.description_en;
    jobContainer.querySelector('.like-history-timestamp').textContent = 'Last changed: ' + formatTimestamp(job);

    // get job buttons
    const jobBtns = getContainerButtons(jobContainer);

    // un-hide required buttons
    if (job.answer === 'like') jobBtns.likeBtn.style.display = '';
    if (job.answer === 'dislike') jobBtns.dislikeBtn.style.display = '';
    if (job.shortlist == null) jobBtns.addToShortlistBtn.style.display = '';
    if (job.shortlist != null) jobBtns.removeShortlistBtn.style.display = '';

    // add jobId to dataset
    for (const button in jobBtns) {
      jobBtns[button].dataset.jobId = job.id;
    }

    listContainer.appendChild(jobContainer);
  }
}

function formatTimestamp(job) {
  // rtf is RelativeTimeFormat
  const rtf = new Intl.RelativeTimeFormat('en', { style: 'long' });
  const jsFormatTimestamp = Date.parse(job.timestamp);
  const secondsSinceLike = Math.floor((Date.now() - jsFormatTimestamp) / 1000);
  if (secondsSinceLike < 60) {
    return rtf.format(-secondsSinceLike, 'second');
  } else if (secondsSinceLike < 60 * 60) {
    return rtf.format(Math.floor(-secondsSinceLike / 60), 'minute');
  } else if (secondsSinceLike < 60 * 60 * 24) {
    return rtf.format(Math.floor(-secondsSinceLike / (60 * 60)), 'hour');
  } else if (secondsSinceLike < 60 * 60 * 24 * 7) {
    return rtf.format(Math.floor(-secondsSinceLike / (60 * 60 * 24)), 'day');
  } else {
    return new Intl.DateTimeFormat('en-GB').format(jsFormatTimestamp);
  }
  // test: UPDATE likes SET time_stamp = DATE_SUB(time_stamp, INTERVAL $ DAY) where job_id = $;
}

function getContainerButtons(container) {
  return {
    likeBtn: container.querySelector('.job-choice-liked'),
    dislikeBtn: container.querySelector('.job-choice-disliked'),
    removeShortlistBtn: container.querySelector('.job-shortlist-remove'),
    addToShortlistBtn: container.querySelector('.job-shortlist-add'),
    confirmShortlistBtn: container.querySelector('.job-shortlist-add-confirm'),
  };
}

function hideFiltered() {
  const listItems = document.querySelectorAll('.list-item-container');
  const filter = document.querySelector('#history-filter-btns > .selected').dataset.filter;
  for (const container of listItems) {
    const choiceBtns = getContainerButtons(container);

    // if liked button is being displayed choice for this job is liked
    const jobChoice = choiceBtns.likeBtn.style.display === '' ? 'like' : 'dislike';

    if (filter === 'none') {
      container.style.display = '';
    } else if (jobChoice === filter) {
      container.style.display = '';
    } else {
      container.style.display = 'none';
    }
  }
}

async function changeChoice(event) {
  const delayPromise = shared.buttonDelay();
  const jobBtns = getContainerButtons(event.target.parentElement);

  event.target.classList.add('active-wait'); // show the button is active
  const success = await submitChoiceChange(event);
  await delayPromise;
  event.target.classList.remove('active-wait');

  if (success) {
    shared.createToast();
    const startingChoice = event.target.dataset.answer;
    switch (startingChoice) {
      case 'like':
        jobBtns.likeBtn.style.display = 'none';
        jobBtns.dislikeBtn.style.display = '';
        break;
      case 'dislike':
        jobBtns.likeBtn.style.display = '';
        jobBtns.dislikeBtn.style.display = 'none';
        break;
      case 'shortlist-remove':
        jobBtns.addToShortlistBtn.style.display = '';
        jobBtns.removeShortlistBtn.style.display = 'none';
        break;
      case 'shortlist-add':
        jobBtns.removeShortlistBtn.style.display = '';
        jobBtns.confirmShortlistBtn.style.display = 'none';
        jobBtns.addToShortlistBtn.style.display = 'none';
        jobBtns.likeBtn.style.display = '';
        jobBtns.dislikeBtn.style.display = 'none';
        break;
    }
  } else {
    document.querySelector('h1').textContent = 'Something went wrong! Please refresh';
  }
}

async function submitChoiceChange(event) {
  const userInput = {};
  const answerBtn = event.target;
  const updatedChoice = answerBtn.dataset.answer;
  const itemId = answerBtn.dataset.jobId;
  userInput.itemId = itemId;
  switch (updatedChoice) {
    case 'like':
      userInput.choice = 'dislike';
      break;
    case 'dislike':
      userInput.choice = 'like';
      break;
    case 'shortlist-remove':
      userInput.choice = 'shortlist-remove';
      break;
    case 'shortlist-add':
      userInput.choice = 'shortlist-add';
      break;
  }
  const response = await postJobChange(userInput);
  if (!response.ok) {
    console.log('Error from server: ' + response.statusText + '. Choice change failed');
  }
  return (response.ok);
}

async function postJobChange(userInput) {
  const response = await fetch('user/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userInput),
  });
  return response;
}

function addEventListeners() {
  for (const button of document.querySelectorAll('#history-filter-btns > button')) {
    button.addEventListener('click', setFilter);
  }

  const choiceSelector = `
    .job-choice-liked,
    .job-choice-disliked,
    .job-shortlist-remove,
    .job-shortlist-add-confirm`;
  for (const button of document.querySelectorAll(choiceSelector)) {
    button.addEventListener('click', changeChoice);
  }

  for (const button of document.querySelectorAll('.job-shortlist-add')) {
    button.addEventListener('click', confirmShortlist);
  }

  document.addEventListener('click', () => {
    // if a confirm shortlist button was clicked do nothing, else hide confirm buttons
    if (event.target.dataset.answer === 'shortlist-add') return;

    for (const confirmBtn of document.querySelectorAll('.job-shortlist-add-confirm')) {
      if (confirmBtn.style.display === '') {
        confirmBtn.style.display = 'none';
        confirmBtn.previousElementSibling.style.display = '';
      }
    }
  });
}

async function confirmShortlist(event) {
  const shortlistAddBtn = event.target;
  const shortlistAddConfirm = event.target.nextElementSibling;
  shortlistAddBtn.classList.add('active-wait');
  await shared.buttonDelay();
  shortlistAddBtn.classList.remove('active-wait');
  shortlistAddBtn.style.display = 'none';
  shortlistAddConfirm.style.display = '';
}

function setFilter(event) {
  for (const button of document.querySelectorAll('#history-filter-btns > button')) {
    button.classList.remove('selected');
  }

  event.target.classList.add('selected'); // add selected class to new filter
  hideFiltered();
}

async function loadPage() {
  shared.showLoadingLabel();
  shared.initNavbar();
  displayLikeHistory(await getLikeHistory());
  shared.checkEmptyPage();
  addEventListeners();

  // hide loading label and show main
  shared.hideLoadingLabel();
}

window.addEventListener('load', loadPage);
