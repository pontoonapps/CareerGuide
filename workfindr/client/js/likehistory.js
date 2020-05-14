// swipeHistory.js

async function getSwipHist() {
  const response = await fetch('user/jobs');

  if (response.ok) {
    const jList = await response.json();
    return jList.jobs;
  } else {
    console.log('Error from server: ' + response.status + '. Could not get question history');
  }
}

async function loadSwipHist() {
  const tmplt = document.querySelector('#swipe-history-template');
  const jobList = await getSwipHist();
  for (const job of jobList) {
    const jobContnr = document.importNode(tmplt.content, true);

    jobContnr.querySelector('.swipe-item-image').src = job.image;
    jobContnr.querySelector('.swipe-item-image').alt = job.title + 'image';
    jobContnr.querySelector('.list-item-title').textContent = job.title;
    jobContnr.querySelector('.swipe-item-desc').textContent = job.description;
    jobContnr.querySelector('.swipe-choice').classList.add(job.swipe);
    jobContnr.querySelector('.swipe-choice').textContent = (job.swipe === 'liked' ? '👍' : '👎');
    jobContnr.querySelector('.swipe-choice').dataset.jobid = job.id;
    jobContnr.querySelector('.swipe-choice').addEventListener('click', changeSwipe);

    const main = document.querySelector('main');
    main.appendChild(jobContnr);
  }
}

function changeSwipe() {
  const succSub = subSwipChange();
  if (succSub) {
    switch (event.target.classList[1]) {
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
  } else {
    document.querySelector('h1').textContent = 'Something went wrong! Please refresh';
  }
}

async function subSwipChange() {
  const usrInput = {};
  usrInput.itemid = event.target.dataset.jobid;
  switch (event.target.classList[1]) {
    case 'liked':
      usrInput.choice = 'dislike';
      break;
    case 'disliked':
      usrInput.choice = 'like';
      break;
  }
  const response = await submitChange(usrInput);

  if (!response.ok) {
    console.log('error from server: ' + response.statusText + '. Swipe change failed');
  }
  return (response.ok);
}

async function submitChange(usrInput) {
  const response = await fetch('/user/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(usrInput),
  });
  return response;
}

function loadPage() {
  loadSwipHist();
}

window.addEventListener('load', loadPage);