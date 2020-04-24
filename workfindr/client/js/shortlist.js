// shortlist.js

async function getShortlist() {
  const response = await fetch('/user/jobs/shortlist');

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
    cont.querySelector('.viewMore').addEventListener('click', viewMore);

    const main = document.querySelector('main');
    main.appendChild(cont);
  }
}

function viewMore() {
  // loop to reset all nodes to normal size
  for (const node of document.querySelectorAll('.listItemContainer')) {
    node.classList.remove('expanded');
  }
  if (document.querySelector('.rmvShrtItem') !== null) {
    document.querySelector('.rmvShrtItem').remove();
  }
  const listItemCont = event.target.parentNode.parentNode;
  listItemCont.classList.add('expanded');

  const buttonCont = event.target.parentNode;

  const remFromShortlist = document.createElement('button');
  remFromShortlist.classList.add('button');
  remFromShortlist.classList.add('btn-type1');
  remFromShortlist.classList.add('rmvShrtItem');
  remFromShortlist.textContent = 'Remove from shortlist';
  buttonCont.appendChild(remFromShortlist);
}

function loadPage() {
  loadSList();
}

window.addEventListener('load', loadPage);
