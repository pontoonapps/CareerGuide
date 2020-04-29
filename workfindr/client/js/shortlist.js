// shortlist.js

async function getShortlist() {
  const response = await fetch('user/jobs?choice=shortlist'); // TODO is choice the best name here? Would page be better

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
    console.log(job);
    if (job.shortlisted === 'true') {
      const jobContnr = document.importNode(tmplt.content, true);

      jobContnr.querySelector('.swipeItemImg').src = job.image;
      jobContnr.querySelector('.swipeItemImg').alt = job.title + 'image';
      jobContnr.querySelector('.listItemTitle').textContent = job.title;
      jobContnr.querySelector('.swipeItemDesc').textContent = job.description;
      jobContnr.querySelector('.viewMore').addEventListener('click', dispDetailedDesc);
      jobContnr.querySelector('.viewMore').dataset.jobid = job.id;

      const main = document.querySelector('main');
      main.appendChild(jobContnr);
    }
  }
}

function dispDetailedDesc() {
  // reset changes from previous detailed view

  // reset all nodes to normal size
  for (const jobContnr of document.querySelectorAll('.listItemContainer')) {
    jobContnr.classList.remove('expanded');
  }

  // set view more buttons text back from view less and reset event listener
  for (const viewMoreBtn of document.querySelectorAll('.viewMore')) {
    viewMoreBtn.textContent = 'View More';
    viewMoreBtn.removeEventListener('click', hideDetailDesc);
    viewMoreBtn.addEventListener('click', dispDetailedDesc);
  }

  // remove removeFromShorlist button from previous detailed view (if there is one)
  if (document.querySelector('.rmvShrtItem') !== null) {
    document.querySelector('.rmvShrtItem').remove();
  }

  // change target container to detailed view

  // get required DOM elements
  const viewMore = event.target;
  const buttonCont = viewMore.parentNode;
  const listItemCont = buttonCont.parentNode;

  // change view more button text to view less
  viewMore.textContent = 'View Less';
  viewMore.removeEventListener('click', dispDetailedDesc);
  viewMore.addEventListener('click', hideDetailDesc);

  // expand job container
  listItemCont.classList.add('expanded');

  // add remove from shortlist button
  const remItem = document.createElement('button');
  remItem.classList.add('button');
  remItem.classList.add('btn-type1');
  remItem.classList.add('rmvShrtItem');
  remItem.textContent = 'Remove'; // TODO align text to center of button when in mobile view
  remItem.dataset.jobid = viewMore.dataset.jobid;
  remItem.addEventListener('click', remShrtlstItem);
  buttonCont.appendChild(remItem);
}

async function remShrtlstItem() {
  const removal = {};
  removal.itemid = event.target.dataset.jobid;
  removal.choice = 'shortlist';
  const response = await fetch('/user/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(removal),
  });

  if (!response.ok) {
    console.log('Error removing job from shortlist');
    console.log(response);
  }
  return response;
}

function hideDetailDesc() {
  // remove expanded class
  const listItemCont = event.target.parentNode.parentNode;
  listItemCont.classList.remove('expanded');

  // update event listener from show more to show less
  const viewMore = event.target;
  viewMore.textContent = 'View More';
  viewMore.removeEventListener('click', hideDetailDesc);
  viewMore.addEventListener('click', dispDetailedDesc);

  // remove removeFromShortlist button
  document.querySelector('.rmvShrtItem').remove();
}

function loadPage() {
  loadShortList();
}

window.addEventListener('load', loadPage);
