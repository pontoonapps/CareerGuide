// swipeHistory.js

async function getSHistory() {
  const response = await fetch('/user/jobs/swiped');

  if (response.ok) {
    const jList = await response.json();
    return jList.jobs;
  } else {
    console.log('error', response.status, 'could not get question history');
  }
}

async function loadSHistory() {
  const tmplt = document.querySelector('#swipe-history-template');
  const jobList = await getSHistory();
  for (const job of jobList) {
    const cont = document.importNode(tmplt.content, true);

    cont.querySelector('.swipeItemImg').src = job.image;
    cont.querySelector('.swipeItemImg').alt = job.title + 'image';
    cont.querySelector('.listItemTitle').textContent = job.title;
    cont.querySelector('.swipeItemDesc').textContent = job.description;
    cont.querySelector('.swipeChoice').classList.add(job.swipe);
    cont.querySelector('.swipeChoice').textContent = (job.swipe === 'liked' ? '👍' : '👎');

    const main = document.querySelector('main');
    main.appendChild(cont);
  }
}

function loadPage() {
  loadSHistory();
}

window.addEventListener('load', loadPage);
