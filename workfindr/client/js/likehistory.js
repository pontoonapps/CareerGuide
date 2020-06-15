async function getSwipeHistory() {
  const response = await fetch('user/jobs');

  if (response.ok) {
    const jobList = await response.json();
    return jobList;
  } else {
    console.log('Error from server: ' + response.status + '. Could not get question history');
  }
}

async function loadSwipeHistory() {
  const template = document.querySelector('#swipe-history-template');
  const jobList = await getSwipeHistory();
  const main = document.querySelector('main');
  for (const job of jobList) {
    if (job.swipe === 'show later') {
      continue;
    }

    const jobContainer = document.importNode(template.content, true);
    jobContainer.querySelector('.swipe-item-image').src = 'img/' + job.image;
    jobContainer.querySelector('.swipe-item-image').alt = job.title_en + 'image';
    jobContainer.querySelector('.list-item-title').textContent = job.title_en;
    jobContainer.querySelector('.swipe-item-desc').textContent = job.description_en;
    jobContainer.querySelector('.swipe-choice').classList.add(job.swipe);
    jobContainer.querySelector('.swipe-choice').textContent = (job.swipe === 'like' ? '👍' : '👎');
    jobContainer.querySelector('.swipe-choice').dataset.jobId = job.id;
    jobContainer.querySelector('.swipe-choice').addEventListener('click', changeSwipe);

    main.appendChild(jobContainer);
  }
  if (jobList.length === 0) {
    const empty = document.querySelector('#empty-page');
    empty.style.display = '';
  }
}

function changeSwipe(event) {
  const succSub = submitSwipeChange(event);
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

async function submitSwipeChange(event) {
  const userInput = {};
  const updatedSwipe = event.target.classList[1];
  const itemId = event.target.dataset.jobId;
  userInput.itemId = itemId;
  switch (updatedSwipe) {
    case 'like':
      userInput.choice = 'dislike';
      break;
    case 'dislike':
      userInput.choice = 'like';
      break;
  }
  const response = await submitChange(userInput);

  if (!response.ok) {
    console.log('Error from server: ' + response.statusText + '. Swipe change failed');
  }
  return (response.ok);
}

async function submitChange(userInput) {
  const response = await fetch('user/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userInput),
  });
  return response;
}

async function checkLogin() {
  const reponse = await fetch('user/');
  if (reponse.status === 401) {
    window.location = './';
  }
}

function loadPage() {
  checkLogin();
  loadSwipeHistory();
}

window.addEventListener('load', loadPage);
