// swipepage.js

let currentItem; // job being displayed on page

async function getNextItem() {
  const response = await fetch('/user/next-item');
  if (response.ok) {
    const item = await response.json();
    return item;
  } else {
    console.log('Error from server: ' + response.status + '. Could not get next swipe item');
  }
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
      swipe.choice = 'shortlist-add';
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
    document.querySelector('h1').textContent = 'Something went wrong! Please refresh';
    return false;
  }
  return true;
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
  const response = await fetch('user/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(swipe),
  });
  return response;
}

async function loadNextItem() {
  currentItem = await getNextItem();
  currentItem.id = String(currentItem.id); // ensures itemid type sent to server is consistent
  displayItem(currentItem);
}

function displayItem(item) {
  document.querySelector('#info-text').textContent = ''; // reset for the case of a job then a question
  document.querySelector('#title').textContent = item.title;
  document.querySelector('#swipe-image').src = item.image;

  // description is null with questions
  if (item.description === undefined) {
    document.querySelector('#btn-shortlist').style = 'display: none'; // don't display shortlist button on questions
  } else {
    document.querySelector('#btn-shortlist').removeAttribute('style');
    document.querySelector('#info-text').textContent = item.description;
  }
}

function addELs() {
  document.querySelector('#btn-like').addEventListener('click', async () => {
    if (await subSwipe(event)) { // only load next item if subSwip returns true
      loadNextItem();
    }
  });
  document.querySelector('#btn-showLater').addEventListener('click', async () => {
    if (await subSwipe(event)) {
      loadNextItem();
    }
  });
  document.querySelector('#btn-dislike').addEventListener('click', async () => {
    if (await subSwipe(event)) {
      loadNextItem();
    }
  });
  document.querySelector('#btn-shortlist').addEventListener('click', async () => {
    if (await subSwipe(event)) {
      loadNextItem();
    }
  });
}

function setMainHeight() {
  // get required elements
  const main = document.querySelector('#swipe-page');
  const navBar = document.querySelector('nav');

  // get display sizes
  const vpHeight = window.innerHeight; // viewport height
  const vpWidth = window.innerWidth; // viewport width
  const navHeight = navBar.offsetHeight;
  const mainWidth = main.offsetWidth;
  const sideMargin = (vpWidth - mainWidth) / 2; // margin required to center main
  const ftrHeight = 0; // TODO add footer

  // apply to swipe page
  main.style.margin = navHeight + 'px ' + sideMargin + 'px ' + ftrHeight + 'px'; // top, right & left, bottom
  main.style.height = vpHeight - navHeight + 'px';
}

// start script (after page has loaded)

function loadPage() {
  addELs(); // add Event Listeners
  setMainHeight();
  loadNextItem(); // initiate page
}

window.addEventListener('load', loadPage);
