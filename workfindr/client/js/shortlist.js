// shortlist.js

async function getShortlist() {
  const response = await fetch('user/jobs');

  if (response.ok) {
    const jList = await response.json();
    return jList.jobs;
  } else {
    console.log('error', response.status, 'could not get shortlist');
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
      jobContnr.querySelector('.rmv-shrt-item').addEventListener('click', remShrtlstItem);
      jobContnr.querySelector('.rmv-shrt-item').dataset.jobid = job.id;

      const main = document.querySelector('main');
      main.appendChild(jobContnr);
    }
  }
}

function dispDetailedDesc() {
  // reset changes from previous detailed view

  // reset all nodes to normal size
  for (const jobContnr of document.querySelectorAll('.list-item-container')) {
    jobContnr.classList.remove('expanded');
  }

  // set view more buttons text back from view less and reset event listener
  for (const viewMoreBtn of document.querySelectorAll('.viewMore')) {
    viewMoreBtn.textContent = 'View More';
    viewMoreBtn.removeEventListener('click', hideDetailDesc);
    viewMoreBtn.addEventListener('click', dispDetailedDesc);
  }

  // remove removeFromShorlist button from previous detailed view (if there is one)
  for (const rmvBtn of document.querySelectorAll('.rmv-shrt-item')) {
    rmvBtn.style = 'display: none;';
  }

  // change target container to detailed view

  // get required DOM elements
  const viewMore = event.target;
  const remove = viewMore.nextElementSibling;
  const buttonCont = viewMore.parentNode;
  const listItemCont = buttonCont.parentNode;

  // change view more button text to view less
  viewMore.textContent = 'View Less';
  viewMore.removeEventListener('click', dispDetailedDesc);
  viewMore.addEventListener('click', hideDetailDesc);

  // remove display none from remove button in this container
  remove.style = '';

  // expand job container
  listItemCont.classList.add('expanded');
}

async function remShrtlstItem() {
  const remove = event.target;
  const btnContnr = remove.parentNode;
  const jobContnr = btnContnr.parentNode;
  const succSub = await subRemoval();
  if (succSub) {
    jobContnr.remove();
  } else {
    document.querySelector('h1').textContent = 'Something went wrong! Please refresh';
  }
}

async function subRemoval() {
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
  // remove expanded class
  // TODO change parentNode.parentNode, split target parent node into another variable
  const listItemCont = event.target.parentNode.parentNode; 
  listItemCont.classList.remove('expanded');

  // get required DOM elements
  const viewMore = event.target;
  const remove = viewMore.nextElementSibling;

  // update event listener from show more to show less
  viewMore.textContent = 'View More';
  viewMore.removeEventListener('click', hideDetailDesc);
  viewMore.addEventListener('click', dispDetailedDesc);

  // remove removeFromShortlist button
  remove.style = 'display: none;';
}

function loadPage() {
  loadShortList();
}

window.addEventListener('load', loadPage);
