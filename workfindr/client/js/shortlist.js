// shortlist.js

async function getShortlist() {
  const response = await fetch('/user/jobs/swiped');

  if (response.ok) {
    const jobList = await response.json();
    return jobList;
  }
  console.log('error could not get shortlist');
  return [];
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

    const main = document.querySelector('main');
    main.appendChild(cont);
  }
}

function loadPage() {
  loadSList();
}

window.addEventListener('load', loadPage);
