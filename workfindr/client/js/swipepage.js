// swipepage.js

const swipes = [];

const data = {
  jobs: [{
    id: 0,
    title: 'Plumber',
    description: 'Red dungarees and hat included',
    image: 'img/tempImage.png',
  }, {
    id: 1,
    title: 'Programmer',
    description: 'Light up keyboard provided',
    image: 'img/tempImage.png',
  }, {
    id: 2,
    title: 'Con artist',
    description: 'Steals your valuable possessions',
    image: 'img/tempImage.png',
  }, {
    id: 3,
    title: 'Teacher',
    description: '"Might" teach you things',
    image: 'img/tempImage.png',
  }],
};

function getJob() {
  // in application this will get a job from the server
  return data.jobs[swipes.length % data.jobs.length]; // % used for inifnite job swiping
}

function submitSwipe(event) {
  // in application this will send the swipe data to the server
  swipes.push({ type: event.target.textContent, job: data.jobs[swipes.length % data.jobs.length].id });
}

function loadNextJob() {
  if (event.target.id !== undefined) { // if this is the first job being displayed, no swipe has been made
    submitSwipe(event);
  }
  const job = getJob();
  displayJob(job);
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
