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
    case 'btn-yes':
      swipe.choice = 'yes';
      break;
    case 'btn-no':
      swipe.choice = 'no';
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

function dispInfoText(str) {
  // get required DOM elements
  const infoText = document.querySelector('#info-text');
  const showMore = document.querySelector('#show-more');
  const showLess = document.querySelector('#show-less');

  // calculate how many characters can be displayed
  let empx = window.getComputedStyle(infoText).fontSize;
  empx = empx.slice(0, empx.length - 2); // remove px from .fontSize

  const height = infoText.dataset.origHeight - empx; // -empx for a spare line to ensure no overflow
  const width = infoText.offsetWidth;
  const noChars = Math.floor(height * width / Math.pow(empx, 2)); // num displayable chars = area / area of a char

  // if the num of displayable chars is less than string length, shorten else disp string
  if (noChars < str.length) {
    showMore.removeAttribute('style');
    showLess.style.display = 'none';
    infoText.textContent = str.slice(0, noChars) + '…';
  } else {
    showMore.style.display = 'none';
    showLess.style.display = 'none';
    infoText.textContent = str;
  }
}

function expandInfoText() {
  // get required DOM elements
  const infoText = document.querySelector('#info-text');
  const showMore = document.querySelector('#show-more');
  const showLess = document.querySelector('#show-less');

  // toggle show more / show less button
  showMore.style.display = 'none';
  showLess.removeAttribute('style');

  // expand info text container
  infoText.textContent = currentItem.description;
  infoText.classList.add('expanded');
}

function shrinkInfoText() {
  // get required DOM elements
  const infoText = document.querySelector('#info-text');
  const showMore = document.querySelector('#show-more');
  const showLess = document.querySelector('#show-less');

  // toggle show more / show less button
  showMore.removeAttribute('style');
  showLess.style.display = 'none';

  // shrink info text container
  infoText.classList.remove('expanded');
  dispInfoText(currentItem.description);
}

function displayItem(item) {
  const infoText = document.querySelector('#info-text');
  infoText.dataset.origHeight = infoText.offsetHeight;

  document.querySelector('#title').textContent = item.title;
  document.querySelector('#swipe-image').src = item.image;

  if (item.description === undefined) { // if question else job
    // hide job buttons
    document.querySelector('#btn-shortlist').style.display = 'none';
    document.querySelector('#btn-dislike').style.display = 'none';
    document.querySelector('#btn-showLater').style.display = 'none';
    document.querySelector('#btn-like').style.display = 'none';
    document.querySelector('#show-more').style.display = 'none';
    document.querySelector('#show-less').style.display = 'none';

    // show question buttons
    document.querySelector('#btn-yes').removeAttribute('style');
    document.querySelector('#btn-no').removeAttribute('style');

    // set description to blank (as questions don't have descriptions)
    document.querySelector('#info-text').textContent = '';
  } else {
    // hide question buttons
    document.querySelector('#btn-yes').style.display = 'none';
    document.querySelector('#btn-no').style.display = 'none';

    // show job buttons
    document.querySelector('#btn-shortlist').removeAttribute('style');
    document.querySelector('#btn-dislike').removeAttribute('style');
    document.querySelector('#btn-showLater').removeAttribute('style');
    document.querySelector('#btn-like').removeAttribute('style');

    // show description
    dispInfoText(item.description);
  }
}

function addELs() {
  window.addEventListener('resize', setMainHeight);
  window.addEventListener('resize', () => {
    displayItem(currentItem);
  });
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
  document.querySelector('#btn-yes').addEventListener('click', async () => {
    if (await subSwipe(event)) {
      loadNextItem();
    }
  });
  document.querySelector('#btn-no').addEventListener('click', async () => {
    if (await subSwipe(event)) {
      loadNextItem();
    }
  });
  document.querySelector('#show-more').addEventListener('click', expandInfoText);
  document.querySelector('#show-less').addEventListener('click', shrinkInfoText);
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
  const heightBffr = vpHeight / 20; // height buffer of 1/20 added to make space for URL bar on mobile
  const mainHeight = vpHeight - (navHeight + ftrHeight + heightBffr);

  // apply to swipe page
  main.style.margin = navHeight + 'px ' + sideMargin + 'px ' + ftrHeight + 'px'; // top, right & left, bottom
  main.style.height = mainHeight + 'px';
  main.style.maxHeight = mainHeight + 'px';
}

// start script (after page has loaded)

async function loadPage() {
  addELs(); // add Event Listeners
  setMainHeight();
  await loadNextItem(); // await so buttons aren't displayed before being hidden
  document.querySelector('#swipe-btns').removeAttribute('style');
}

window.addEventListener('load', loadPage);
