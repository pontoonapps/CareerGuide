// swipeHistory.js

async function getSwipHist() {
  const response = await fetch('/user/jobs/swiped');

  if (response.ok) {
    const jList = await response.json();
    return jList.jobs;
  } else {
    console.log('error', response.status, 'could not get question history');
  }
}

async function loadSwipHist() {
  const tmplt = document.querySelector('#swipe-history-template');
  const jobList = await getSwipHist();
  for (const job of jobList) {
    const cont = document.importNode(tmplt.content, true);

    cont.querySelector('.swipeItemImg').src = job.image;
    cont.querySelector('.swipeItemImg').alt = job.title + 'image';
    cont.querySelector('.listItemTitle').textContent = job.title;
    cont.querySelector('.swipeItemDesc').textContent = job.description;
    cont.querySelector('.swipeChoice').classList.add(job.swipe);
    cont.querySelector('.swipeChoice').textContent = (job.swipe === 'liked' ? '👍' : '👎');
    cont.querySelector('.swipeChoice').addEventListener('click', changeSwipe)

    const main = document.querySelector('main');
    main.appendChild(cont);
  }
}

function changeSwipe() {
  submitSwipeChangeToServer(); // overly verbose example function
  switch(event.target.classList[1]) {
    case 'liked':
      event.target.classList.remove('liked');
      event.target.classList.add('disliked');
      event.target.textContent = '👎';
      break;
    case 'disliked':
      event.target.classList.remove('disliked');
      event.target.classList.add('liked');
      event.target.textContent = '👍';
      break;
  }
}

function submitSwipeChangeToServer() {
  console.log('this function will submit the swipe change');
}

function loadPage() {
  loadSwipHist();
}

window.addEventListener('load', loadPage);
