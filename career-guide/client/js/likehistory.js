import { createToast } from './shared-module.js';

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

    // btn-3 is green btn-1 is red
    const jobChoiceClass = job.answer === 'like' ? 'btn-3' : 'btn-1';
    const jobChoiceText = job.answer === 'like' ? 'Liked' : 'Disliked';
    const jobShortlistText = job.shortlist == null ? 'Add to shortlist' : 'Remove from shortlist';
    const shortlisted = job.shortlist == null ? 'not-shortlisted' : 'shortlisted';
    const jobContainer = document.importNode(template.content, true);

    jobContainer.querySelector('.job-image').src = 'img/' + job.image;
    jobContainer.querySelector('.job-image').alt = job.title_en + 'image';
    jobContainer.querySelector('.list-item-title').textContent = job.title_en;
    jobContainer.querySelector('.job-desc').textContent = job.description_en;
    jobContainer.querySelector('.job-choice').classList.add(jobChoiceClass);
    jobContainer.querySelector('.job-choice').textContent = jobChoiceText;
    jobContainer.querySelector('.job-choice').dataset.jobId = job.id;
    jobContainer.querySelector('.job-choice').dataset.answer = job.answer;
    jobContainer.querySelector('.job-choice').addEventListener('click', changeChoice);
    jobContainer.querySelector('.job-shortlist').dataset.jobId = job.id;
    jobContainer.querySelector('.job-shortlist').dataset.answer = shortlisted;
    jobContainer.querySelector('.job-shortlist').textContent = jobShortlistText;
    jobContainer.querySelector('.job-shortlist').addEventListener('click', changeChoice);

    listContainer.appendChild(jobContainer);
  }
}

function hideFiltered() {
  const listItems = document.querySelectorAll('.list-item-container');
  const filter = document.querySelector('#history-filter-btns > .selected').dataset.filter;
  for (const container of listItems) {
    const jobChoice = container.querySelector('.btn-container > .job-choice').dataset.answer;

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
  const jobChoiceBtn = event.target;
  const delayPromise = timeoutDelay(BUTTON_DELAY);
  jobChoiceBtn.classList.add('active-wait'); // show the button is active

  const success = await submitChoiceChange(event);

  await delayPromise;
  jobChoiceBtn.classList.remove('active-wait');

  if (success) {
    createToast();
    const startingChoice = jobChoiceBtn.dataset.answer;
    switch (startingChoice) {
      case 'like':
        jobChoiceBtn.classList.remove('btn-3');
        jobChoiceBtn.classList.add('btn-1');
        jobChoiceBtn.dataset.answer = 'dislike';
        jobChoiceBtn.textContent = 'Disliked';
        break;
      case 'dislike':
        jobChoiceBtn.classList.remove('btn-1');
        jobChoiceBtn.classList.add('btn-3');
        jobChoiceBtn.dataset.answer = 'like';
        jobChoiceBtn.textContent = 'Liked';
        break;
      case 'shortlisted':
        jobChoiceBtn.textContent = 'Add to shortlist';
        jobChoiceBtn.dataset.answer = 'not-shortlisted';
        break;
      case 'not-shortlisted':
        jobChoiceBtn.textContent = 'Remove from shortlist';
        jobChoiceBtn.dataset.answer = 'shortlisted';
        break;
    }
    hideFiltered();
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
    case 'shortlisted':
      userInput.choice = 'shortlist-remove';
      break;
    case 'not-shortlisted':
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

function addFilterEventListeners() {
  for (const button of document.querySelectorAll('#history-filter-btns > button')) {
    button.addEventListener('click', setFilter);
  }
}

function setFilter(event) {
  // if filter button is already selected do nothing
  if (event.target.classList.contains('selected')) return;

  // clear selected from previous selected filter
  for (const button of document.querySelectorAll('#history-filter-btns > button')) {
    button.classList.remove('selected');
  }

  event.target.classList.add('selected'); // add selected class to new filter
  hideFiltered();
}

function timeoutDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const BUTTON_DELAY = 250;

function checkEmptyPage() {
  if (document.querySelector('.list-item-container') == null) {
    document.querySelector('#empty-page').style.display = '';
  }
}

async function loadPage() {
  displayLikeHistory(await getLikeHistory());
  checkEmptyPage();
  addFilterEventListeners();
  // hide loading label and show main
  document.querySelector('main').style.display = '';
  document.querySelector('#loadingLabel').style.display = 'none';
}

window.addEventListener('load', loadPage);
