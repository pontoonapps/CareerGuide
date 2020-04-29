// swipepage.js

let currentItem; // job being displayed on page

// FIXME: items (seemingly) randomly stop loading after swiping for a while

async function getNextItem() {
  const rawItem = await fetch('/user/next-item');
  if (rawItem.ok) {
    const item = await rawItem.json();
    return item;
  }
  return 'error connecting to server';
}

async function submitInput(event) {
  // get user choice (shortlisting questions???)
  const usrInput = {};
  usrInput.jobid = currentItem.id;
  switch (event.target.id) {
    case 'btn-dislike':
      usrInput.choice = 'dislike';
      break;
    case 'btn-showLater':
      usrInput.choice = 'showLater';
      break;
    case 'btn-like':
      usrInput.choice = 'like';
      break;
    case 'btn-shortlist':
      usrInput.choice = 'shortlist';
      break;
    default:
      console.log('invalid user input!!');
      break;
  }

  // identify whether current item is job or question is there a better
  // way than a lack of description? should there be an attribute marking job or question?
  let response;
  if (currentItem.description === undefined) {
    response = await submitQInput(usrInput);
  } else {
    response = await submitJInput(usrInput);
  }

  // log if error connecting to server
  if (!response.ok) {
    console.log('error submitting input');
  }
}

async function submitJInput(usrInput) {
  const response = await fetch('/user/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(usrInput),
  });
  return response;
}

async function submitQInput(usrInput) {
  const response = await fetch('/user/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(usrInput),
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
    submitInput(event);
    loadNextItem();
  });
  document.querySelector('#btn-showLater').addEventListener('click', () => {
    submitInput(event);
    loadNextItem();
  });
  document.querySelector('#btn-dislike').addEventListener('click', () => {
    submitInput(event);
    loadNextItem();
  });
  document.querySelector('#btn-shortlist').addEventListener('click', () => {
    submitInput(event); // arrow function for consistency, loadNextItem function not required when shortlisting
  });
}

// start script (after page has loaded)

function loadPage() {
  addELs(); // add Event Listeners
  loadNextItem(); // initiate page
}

window.addEventListener('load', loadPage);
