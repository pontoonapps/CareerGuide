// swipepage.js

async function getNextItem() {
  const rawItem = await fetch('/user/next-item');
  if (rawItem.ok) {
    const item = await rawItem.json();
    console.log(item);
    return item;
  }
  return 'error connecting to server';
}

function submitSwipe(event) {
  // in application this will send the swipe data to the server
  // swipes.push({ type: event.target.textContent, job: data.jobs[swipes.length % data.jobs.length].id });
  return true;
}

async function loadNextJob() {
  if (event.target.id !== undefined) { // if this is the first job being displayed, no swipe has been made
    submitSwipe(event);
  }
  displayJob(await getNextItem());
}

function displayJob(job) {
  document.querySelector('#title').textContent = job.title;
  document.querySelector('#info-text').textContent = job.description;
}

function addELs() {
  document.querySelector('#btn-like').addEventListener('click', loadNextJob);
  document.querySelector('#btn-showLater').addEventListener('click', loadNextJob);
  document.querySelector('#btn-dislike').addEventListener('click', loadNextJob);
}

// start script (after page has loaded)

function loadPage() {
  addELs(); // add Event Listeners
  loadNextJob(); // initiate page
}

window.addEventListener('load', loadPage);
