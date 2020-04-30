// swipepage.js

let currentItem; // job being displayed on page

async function getNextItem() {
  const rawItem = await fetch('/user/next-item');
  if (rawItem.ok) {
    const item = await rawItem.json();
    return item;
  }
  return 'error connecting to server';
}

async function subSwipe(event) {
  // get user choice (shortlisting questions???)
  const swipe = {};
  swipe.itemid = currentItem.id;
  switch (event.target.id) {
    case 'btn-dislike':
      swipe.choice = 'dislike';
      break;
    case 'btn-showLater':
      swipe.choice = 'showLater';
      break;
    case 'btn-like':
      swipe.choice = 'like';
      break;
    case 'btn-shortlist':
      swipe.choice = 'shortlist';
      break;
    default:
      console.log('invalid user input!!');
      break;
  }

  // identify whether current item is job or question is there a better
  // way than a lack of description? should there be an attribute marking job or question?
  let response;
  if (currentItem.description === undefined) {
    response = await subQuestSwipe(swipe);
  } else {
    response = await subJobSwipe(swipe);
  }

  // log if error connecting to server
  if (!response.ok) {
    console.log('error submitting input');
  }
}

async function subJobSwipe(swipe) {
  const response = await fetch('/user/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(swipe),
  });
  return response;
}

async function subQuestSwipe(swipe) {
  const response = await fetch('/user/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(swipe),
  });
  return response;
}

async function loadNextItem() {
  currentItem = await getNextItem();
  displayItem(currentItem);
}

function displayItem(item) {
  document.querySelector('#title').textContent = item.title;
  // description is null with questions
  if (item.description === undefined) {
    document.querySelector('#btn-shortlist').style = 'display: none'; // don't display shortlist button on questions
  } else {
    document.querySelector('#btn-shortlist').removeAttribute('style');
    document.querySelector('#info-text').textContent = item.description;
  }
}

function addELs() {
  document.querySelector('#btn-like').addEventListener('click', () => {
    subSwipe(event);
    loadNextItem();
  });
  document.querySelector('#btn-showLater').addEventListener('click', () => {
    subSwipe(event);
    loadNextItem();
  });
  document.querySelector('#btn-dislike').addEventListener('click', () => {
    subSwipe(event);
    loadNextItem();
  });
  document.querySelector('#btn-shortlist').addEventListener('click', () => {
    subSwipe(event);
    loadNextItem();
  });
}

// start script (after page has loaded)

function loadPage() {
  addELs(); // add Event Listeners
  loadNextItem(); // initiate page
}

window.addEventListener('load', loadPage);
