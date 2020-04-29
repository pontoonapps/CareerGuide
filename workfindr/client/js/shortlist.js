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
    const cont = document.importNode(tmplt.content, true);

    cont.querySelector('.swipeItemImg').src = job.image;
    cont.querySelector('.swipeItemImg').alt = job.title + 'image';
    cont.querySelector('.listItemTitle').textContent = job.title;
    cont.querySelector('.swipeItemDesc').textContent = job.description;
    cont.querySelector('.viewMore').addEventListener('click', dispDetailedDesc);

    const main = document.querySelector('main');
    main.appendChild(cont);
  }
}

function dispDetailedDesc() {
  // reset all nodes to normal size
  for (const node of document.querySelectorAll('.listItemContainer')) {
    node.classList.remove('expanded');
  }

  // set view more buttons text back from view less and reset event listener
  for (const node of document.querySelectorAll('.viewMore')) {
    node.textContent = 'View More';
    node.removeEventListener('click', hideDetailDesc);
    node.addEventListener('click', dispDetailedDesc); // TODO better variable name than node
  }

  // remove removeFromShorlist button from previous detailed view
  if (document.querySelector('.rmvShrtItem') !== null) {
    document.querySelector('.rmvShrtItem').remove();
  }

  const viewMore = event.target;
  viewMore.textContent = 'View Less';
  viewMore.removeEventListener('click', dispDetailedDesc);
  viewMore.addEventListener('click', hideDetailDesc);

  const listItemCont = event.target.parentNode.parentNode;
  listItemCont.classList.add('expanded');

  const buttonCont = event.target.parentNode;

  const remFromShortlist = document.createElement('button');
  remFromShortlist.classList.add('button');
  remFromShortlist.classList.add('btn-type1');
  remFromShortlist.classList.add('rmvShrtItem');
  remFromShortlist.textContent = 'Remove from shortlist';
  remFromShortlist.addEventListener('click', removeFromShortlist);
  buttonCont.appendChild(remFromShortlist);
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
