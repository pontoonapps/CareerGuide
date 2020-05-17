async function getShortlist() {
  const response = await fetch('user/jobs');

  if (response.ok) {
    const jList = await response.json();
    return jList.jobs;
  } else {
    console.log('Error from server: ' + response.status + '. Could not get shortlist');
  }
}

async function loadShortList() {
  const tmplt = document.querySelector('#shortlist-template');
  const jobList = await getShortlist();
  for (const job of jobList) {
    if (job.shortlisted === 'true') {
      const jobContnr = document.importNode(tmplt.content, true);

      jobContnr.querySelector('.swipe-item-image').src = job.image;
      jobContnr.querySelector('.swipe-item-image').alt = job.title + 'image';
      jobContnr.querySelector('.list-item-title').textContent = job.title;
      jobContnr.querySelector('.swipe-item-desc').textContent = job.description;
      jobContnr.querySelector('.view-more').addEventListener('click', dispDetailedDesc);
      jobContnr.querySelector('.view-more').dataset.jobid = job.id;
      jobContnr.querySelector('.view-less').addEventListener('click', hideDetailDesc);
      jobContnr.querySelector('.view-less').dataset.jobid = job.id;
      jobContnr.querySelector('.rmv-shrt-item').addEventListener('click', remShrtlstItem);
      jobContnr.querySelector('.rmv-shrt-item').dataset.jobid = job.id;

      const main = document.querySelector('main');
      main.appendChild(jobContnr);
    }
  }
}

function dispDetailedDesc() {
  // reset all items to non expanded

  for (const jobContnr of document.querySelectorAll('.list-item-container')) {
    jobContnr.classList.remove('expanded'); // remove expanded class
  }

  for (const rmvBtn of document.querySelectorAll('.rmv-shrt-item')) {
    rmvBtn.style = 'display: none;'; // hide remove button
  }

  for (const viewLess of document.querySelectorAll('.view-less')) {
    viewLess.style = 'display: none;'; // hide view less button
  }

  for (const viewMore of document.querySelectorAll('.view-more')) {
    viewMore.style = ''; // show view more button
  }

  // change target container to detailed view

  // get required DOM elements
  const viewMore = event.target;
  const viewLess = viewMore.nextElementSibling;
  const remove = viewLess.nextElementSibling;
  const buttonCont = viewMore.parentNode;
  const listItemCont = buttonCont.parentNode;

  // hide view more and show view less and remove button
  remove.style = '';
  viewLess.style = '';
  viewMore.style = 'display: none;';

  // add expanded class
  listItemCont.classList.add('expanded');
}

async function remShrtlstItem() {
  const remove = event.target;
  const btnContnr = remove.parentNode;
  const jobContnr = btnContnr.parentNode;
  const succSub = await submitRemoval();
  if (succSub) {
    jobContnr.remove();
  } else {
    document.querySelector('h1').textContent = 'Something went wrong! Please refresh';
  }
}

async function submitRemoval() {
  const removal = {};
  removal.itemid = event.target.dataset.jobid;
  removal.choice = 'shortlist-rem';
  const response = await fetch('/user/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(removal),
  });
  return response;
}

function hideDetailDesc() {
  // get required DOM elements
  const viewLess = event.target;
  const viewMore = viewLess.previousElementSibling;
  const remove = viewLess.nextElementSibling;
  const shrtlistBtnCont = viewLess.parentNode;
  const listItemCont = shrtlistBtnCont.parentNode;

  // remove expanded class
  listItemCont.classList.remove('expanded');

  // hide remove button and view less button, show view more button
  remove.style = 'display: none;';
  viewLess.style = 'display: none;';
  viewMore.style = '';
}

function loadPage() {
  loadShortList();
}

window.addEventListener('load', loadPage);
