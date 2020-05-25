async function getSwipHist() {
  const cookie = document.cookie;
  const name = cookie.slice(cookie.lastIndexOf('=') + 1, cookie.length);
  const response = await fetch(`user/jobs?page=${1}&name=${name}`);

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
    if (job.type === 'show later') {
      return;
    }

    const jobContnr = document.importNode(tmplt.content, true);

    jobContnr.querySelector('.swipe-item-image').src = job.image;
    jobContnr.querySelector('.swipe-item-image').alt = job.title_en + 'image';
    jobContnr.querySelector('.list-item-title').textContent = job.title_en;
    jobContnr.querySelector('.swipe-item-desc').textContent = job.description_en;
    jobContnr.querySelector('.swipe-choice').classList.add(job.type);
    jobContnr.querySelector('.swipe-choice').textContent = (job.type === 'liked' ? '👍' : '👎');
    jobContnr.querySelector('.swipe-choice').dataset.jobid = job.id;
    jobContnr.querySelector('.swipe-choice').addEventListener('click', changeSwipe);

    const main = document.querySelector('main');
    main.appendChild(jobContnr);
  }
}

// FIXME: Can't change swipe anymore
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
