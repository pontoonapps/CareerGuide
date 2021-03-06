import * as shared from './shared.js';

async function getShortlist() {
  const response = await fetch('user/jobs');

  if (response.ok) {
    const jobList = await response.json();
    return jobList;
  }

  if (response.status === 401) {
    // not logged in, redirect to home page
    window.location = './';
  } else {
    console.log('Error from server: ' + response.status + '. Could not get shortlist');
    shared.errorTitle();
  }
  return [];
}

async function loadShortlist() {
  const template = document.querySelector('#shortlist-template');
  const jobList = await getShortlist();

  for (const job of jobList) {
    if (job.shortlist === null) {
      continue;
    }
    const jobContainer = document.importNode(template.content, true);

    jobContainer.querySelector('.job-image').src = 'img/' + job.image;

    const jobTitle = jobContainer.querySelector('.list-item-title');
    shared.bothLanguages(jobTitle, job.title_en, job.title_fr);

    const jobDescription = jobContainer.querySelector('.job-desc');
    shared.bothLanguages(jobDescription, job.description_en, job.description_fr);

    // removed dataset.fullDescription because this isn't required unless we're truncating the text
    jobContainer.querySelector('.remove-shortlist-item').addEventListener('click', removeShortlistItem);
    jobContainer.querySelector('.remove-shortlist-item').dataset.jobid = job.id;

    const listContainer = document.querySelector('#list-container');
    listContainer.appendChild(jobContainer);
  }
}

async function removeShortlistItem(event) {
  const delayPromise = shared.buttonDelay();

  const removeBtn = event.target;
  const jobContainer = removeBtn.parentNode;
  const succSub = await submitRemoval(removeBtn);

  // show the button is active
  removeBtn.classList.add('active-wait');

  await delayPromise;
  removeBtn.classList.remove('active-wait');
  if (succSub) {
    jobContainer.remove();
    shared.checkEmptyPage();
    shared.createToast();
  } else {
    shared.errorTitle();
  }
}

async function submitRemoval(removeBtn) {
  const removal = {};
  removal.itemId = removeBtn.dataset.jobid;
  removal.choice = 'shortlist-remove';
  const response = await fetch('user/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(removal),
  });
  return response;
}

async function loadPage() {
  shared.showLoadingLabel();
  shared.initNavbar();
  await shared.checkLogin();
  await loadShortlist();
  shared.checkEmptyPage();
  shared.hideLoadingLabel();
}

window.addEventListener('load', loadPage);
