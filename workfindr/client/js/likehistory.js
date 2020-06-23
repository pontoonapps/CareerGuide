async function getLikeHistory() {
  const response = await fetch('user/jobs');

  if (response.ok) {
    const jobList = await response.json();
    return jobList;
  }

  if (response.status === 401) {
    // not logged in, redirect to home page
    window.location = './';
  } else {
    console.log('Error from server: ' + response.status + '. Could not get like history');
  }
  return [];
}

async function loadLikeHistory() {
  const template = document.querySelector('#like-history-template');
  const jobList = await getLikeHistory();

  const empty = document.querySelector('#empty-page');

  const listContainer = document.querySelector('#list-container');
  for (const job of jobList) {
    if (job.answer === 'show later') {
      continue;
    }

    const jobContainer = document.importNode(template.content, true);
    jobContainer.querySelector('.job-image').src = 'img/' + job.image;
    jobContainer.querySelector('.job-image').alt = job.title_en + 'image';
    jobContainer.querySelector('.list-item-title').textContent = job.title_en;
    jobContainer.querySelector('.job-desc').textContent = job.description_en;
    jobContainer.querySelector('.job-choice').classList.add(job.answer);
    jobContainer.querySelector('.job-choice').textContent = (job.answer === 'like' ? '👍' : '👎');
    jobContainer.querySelector('.job-choice').dataset.jobId = job.id;
    jobContainer.querySelector('.job-choice').addEventListener('click', changeChoice);

    listContainer.appendChild(jobContainer);


    empty.style.display = 'none';
  }
}

function changeChoice(event) {
  const succSub = submitChoiceChange(event);
  if (succSub) {
    const answerBtn = event.target;
    const updatedChoice = event.target.classList[1];
    switch (updatedChoice) {
      case 'like':
        answerBtn.classList.remove('like');
        answerBtn.classList.add('dislike');
        answerBtn.textContent = '👎';
        break;
      case 'dislike':
        answerBtn.classList.remove('dislike');
        answerBtn.classList.add('like');
        answerBtn.textContent = '👍';
        break;
    }
  } else {
    document.querySelector('h1').textContent = 'Something went wrong! Please refresh';
  }
}

async function submitChoiceChange(event) {
  const userInput = {};
  const updatedChoice = event.target.classList[1];
  const itemId = event.target.dataset.jobId;
  userInput.itemId = itemId;
  switch (updatedChoice) {
    case 'like':
      userInput.choice = 'dislike';
      break;
    case 'dislike':
      userInput.choice = 'like';
      break;
  }
  const response = await submitChange(userInput);

  if (!response.ok) {
    console.log('Error from server: ' + response.statusText + '. Choice change failed');
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

async function loadPage() {
  await loadLikeHistory();

  // hide loading label and show main
  document.querySelector('main').style.display = '';
  document.querySelector('#loadingLabel').style.display = 'none';
}

window.addEventListener('load', loadPage);
