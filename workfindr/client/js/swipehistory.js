// swipeHistory.js

async function getSwipHist() {
  const response = await fetch('/user/jobs?choice=swiped');

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
    cont.querySelector('.swipeChoice').setAttribute('jobid', job.id); // TODO user dataspace not attributes
    cont.querySelector('.swipeChoice').addEventListener('click', changeSwipe);

    const main = document.querySelector('main');
    main.appendChild(cont);
  }
}

function changeSwipe() {
  const succSub = subSwipChange(); // overly verbose example function
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
    // report error to user
  }
}

async function subSwipChange() {
  const usrInput = {};
  usrInput.jobid = event.target.getAttribute('jobid');
  switch (event.target.classList[1]) {
    case 'liked':
      usrInput.choice = 'disliked';
      break;
    case 'disliked':
      usrInput.choice = 'liked';
      break;
  }
  const response = await submitChange(usrInput);

  if (!response.ok) {
    console.log('error', response.statusText, 'cant change');
  }
  return (response.ok);
}

async function submitChange(usrInput) { // This is the same function as submitJInput on swipePage, repeated code??
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
