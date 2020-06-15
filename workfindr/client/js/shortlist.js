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

  const empty = document.querySelector('#empty-page');

  for (const job of jobList) {
    if (job.shortlist === null) {
      continue;
    }
    const jobContainer = document.importNode(template.content, true);

    jobContainer.querySelector('.swipe-item-image').src = 'img/' + job.image;
    jobContainer.querySelector('.swipe-item-image').alt = job.title_en + ' image';
    jobContainer.querySelector('.list-item-title').textContent = job.title_en;
    jobContainer.querySelector('.swipe-item-desc').textContent = job.description_en;
    jobContainer.querySelector('.view-more').addEventListener('click', displayDetailedDesc);
    jobContainer.querySelector('.view-more').dataset.jobid = job.id;
    jobContainer.querySelector('.view-less').addEventListener('click', hideDetailedDesc);
    jobContainer.querySelector('.view-less').dataset.jobid = job.id;
    jobContainer.querySelector('.remove-shortlist-item').addEventListener('click', removeShortlistItem);
    jobContainer.querySelector('.remove-shortlist-item').dataset.jobid = job.id;

    const listContainer = document.querySelector('#list-container');
    listContainer.appendChild(jobContainer);

    empty.style.display = 'none';
  }
}

function displayDetailedDesc() {
  // reset all items to non expanded

  for (const jobContainer of document.querySelectorAll('.list-item-container')) {
    jobContainer.classList.remove('expanded'); // remove expanded class
  }

  for (const removeBtn of document.querySelectorAll('.remove-shortlist-item')) {
    removeBtn.style = 'display: none;'; // hide remove button
  }

  for (const viewLessBtn of document.querySelectorAll('.view-less')) {
    viewLessBtn.style = 'display: none;'; // hide view less button
  }

  for (const viewMoreBtn of document.querySelectorAll('.view-more')) {
    viewMoreBtn.style = ''; // show view more button
  }

  // change target container to detailed view

  // get required DOM elements
  const viewMoreBtn = event.target;
  const viewLessBtn = viewMoreBtn.nextElementSibling;
  const removeBtn = viewLessBtn.nextElementSibling;
  const buttonContainer = viewMoreBtn.parentNode;
  const listItemContainer = buttonContainer.parentNode;

  // hide view more and show view less and remove button
  removeBtn.style = '';
  viewLessBtn.style = '';
  viewMoreBtn.style = 'display: none;';

  // add expanded class
  listItemContainer.classList.add('expanded');
}

async function removeShortlistItem() {
  const removeBtn = event.target;
  const buttonContainer = removeBtn.parentNode;
  const jobContainer = buttonContainer.parentNode;
  const succSub = await submitRemoval(event);
  if (succSub) {
    jobContainer.remove();
  } else {
    document.querySelector('h1').textContent = 'Something went wrong! Please refresh';
  }
}

async function submitRemoval(event) {
  const removal = {};
  removal.itemId = event.target.dataset.jobid;
  removal.choice = 'shortlist-rem';
  const response = await fetch('user/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(removal),
  });
  return response;
}

function hideDetailedDesc() {
  // get required DOM elements
  const viewLessBtn = event.target;
  const viewMoreBtn = viewLessBtn.previousElementSibling;
  const removeBtn = viewLessBtn.nextElementSibling;
  const shortlistButtonContainer = viewLessBtn.parentNode;
  const listItemContainer = shortlistButtonContainer.parentNode;

  // remove expanded class
  listItemContainer.classList.remove('expanded');

  // hide remove button and view less button, show view more button
  removeBtn.style = 'display: none;';
  viewLessBtn.style = 'display: none;';
  viewMoreBtn.style = '';
}

function loadPage() {
  loadShortlist();
}

window.addEventListener('load', loadPage);
