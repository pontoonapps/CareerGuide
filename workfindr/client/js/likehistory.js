async function getSwipHist() {
  const response = await fetch('user/jobs');

  if (response.ok) {
    const jList = await response.json();
    return jList;
  } else {
    console.log('Error from server: ' + response.status + '. Could not get question history');
  }
}

async function loadSwipHist() {
  const tmplt = document.querySelector('#swipe-history-template');
  const jobList = await getSwipHist();
  for (const job of jobList) {
    if (job.swipe === 'show later') {
      continue;
    }

    const jobContnr = document.importNode(tmplt.content, true);
    jobContnr.querySelector('.swipe-item-image').src = 'img/' + job.image;
    jobContnr.querySelector('.swipe-item-image').alt = job.title_en + 'image';
    jobContnr.querySelector('.list-item-title').textContent = job.title_en;
    jobContnr.querySelector('.swipe-item-desc').textContent = job.description_en;
    jobContnr.querySelector('.swipe-choice').classList.add(job.swipe);
    jobContnr.querySelector('.swipe-choice').textContent = (job.swipe === 'like' ? '👍' : '👎');
    jobContnr.querySelector('.swipe-choice').dataset.jobid = job.id;
    jobContnr.querySelector('.swipe-choice').addEventListener('click', changeSwipe);

    const main = document.querySelector('main');
    main.appendChild(jobContnr);
  }
}

function changeSwipe(event) {
  const succSub = subSwipChange(event);
  if (succSub) {
    const swipeChoiceBtn = event.target;
    const updatedSwipe = event.target.classList[1];
    switch (updatedSwipe) {
      case 'like':
        swipeChoiceBtn.classList.remove('like');
        swipeChoiceBtn.classList.add('dislike');
        swipeChoiceBtn.textContent = '👎';
        break;
      case 'dislike':
        swipeChoiceBtn.classList.remove('dislike');
        swipeChoiceBtn.classList.add('like');
        swipeChoiceBtn.textContent = '👍';
        break;
    }
  } else {
    document.querySelector('h1').textContent = 'Something went wrong! Please refresh';
  }
}

async function subSwipChange(event) {
  const usrInput = {};
  const updatedSwipe = event.target.classList[1];
  const itemid = event.target.dataset.jobid;
  usrInput.itemid = itemid;
  switch (updatedSwipe) {
    case 'like':
      usrInput.choice = 'dislike';
      break;
    case 'dislike':
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
