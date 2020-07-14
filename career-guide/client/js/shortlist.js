import { shared } from './shared.js';

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
    jobContainer.querySelector('.job-image').alt = job.title_en + ' image';
    jobContainer.querySelector('.list-item-title').textContent = job.title_en;
    jobContainer.querySelector('.job-desc').textContent = job.description_en;
    jobContainer.querySelector('.job-desc').dataset.fullDescription = job.description_en;
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
    document.querySelector('h1').textContent = 'Something went wrong! Please refresh';
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
  await loadShortlist();
  shared.checkEmptyPage();
  shared.hideLoadingLabel();
}

window.addEventListener('load', loadPage);
