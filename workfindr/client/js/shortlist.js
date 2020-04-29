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

async function loadSList() {
  const tmplt = document.querySelector('#shortlist-template');
  const jobList = await getShortlist();
  for (const job of jobList) {
    const jobContnr = document.importNode(tmplt.content, true);

    jobContnr.querySelector('.swipeItemImg').src = job.image;
    jobContnr.querySelector('.swipeItemImg').alt = job.title + 'image';
    jobContnr.querySelector('.listItemTitle').textContent = job.title;
    jobContnr.querySelector('.swipeItemDesc').textContent = job.description;
    jobContnr.querySelector('.viewMore').addEventListener('click', dispDetailedDesc);

    const main = document.querySelector('main');
    main.appendChild(jobContnr);
  }
}

function dispDetailedDesc() {
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

  // remove removeFromShorlist button from previous detailed view
  if (document.querySelector('.rmvShrtItem') !== null) {
    document.querySelector('.rmvShrtItem').remove();
  }

  // change view more button text to view less
  const viewMore = event.target;
  const buttonCont = viewMore.parentNode;
  const listItemCont = buttonCont.parentNode;

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
  remItem.textContent = 'Remove'; // TODO align text to center of button
  remItem.addEventListener('click', removeFromShortlist);
  buttonCont.appendChild(remItem);
}

function removeFromShortlist() {
  // TODO create remove from shortlist function and rename as currently overly verbose
  console.log('send this job\'s id to the server and remove from shortlist');
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
  loadSList();
}

window.addEventListener('load', loadPage);
