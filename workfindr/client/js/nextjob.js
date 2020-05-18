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
  currentItem.id = String(currentItem.id); // String() ensures itemid type sent to server is consistent
  displayItem(currentItem);
}

function dispInfoText(str) {
  // get required DOM elements
  const infoText = document.querySelector('#info-text');
  const showMore = document.querySelector('#show-more');
  const showLess = document.querySelector('#show-less');

  let cutStr = str;
  infoText.textContent = str;
  while (infoText.clientHeight < infoText.scrollHeight && cutStr.length > 0) {
    cutStr = cutStr.slice(0, cutStr.lastIndexOf(' ')); // remove last word so text is not cut mid word
    infoText.textContent = cutStr;
  }

  if (cutStr !== str) {
    cutStr = cutStr.slice(0, cutStr.lastIndexOf(' ')); // remove one more word so elipses does not overflow
    cutStr += '…';
    infoText.textContent = cutStr;
    showMore.style.display = ''; // remove "display: none;" if descrption was abbreivated
  } else {
    showMore.style.display = 'none'; // if string was not cut do not display showMore button
  }
  showLess.style.display = 'none';
}

function expandInfoText() {
  // set heights to auto
  document.querySelector('#swipe-page').style.height = 'auto';
  document.querySelector('#swipe-info').style.height = 'auto';
  document.querySelector('#info-text').style.height = 'auto';

  // hide show more button and show show less button
  document.querySelector('#show-more').style.display = 'none';
  document.querySelector('#show-less').style.display = '';

  // display full length text
  document.querySelector('#info-text').textContent = currentItem.description;
}

function resetElHeights() {
  // get DOM elements
  const main = document.querySelector('#swipe-page');
  const swipeInfo = document.querySelector('#swipe-info');
  const infoText = document.querySelector('#info-text');

  // set heights to values stored at page load
  main.style.height = main.dataset.origHeight + 'px';
  infoText.style.height = infoText.dataset.origHeight + 'px';
  swipeInfo.style.height = swipeInfo.dataset.origHeight + 'px';
}

function displayItem(item) {
  resetElHeights();

  // display info shared by questions and jobs (image and title)
  dispTitle(item.title);
  document.querySelector('#swipe-image').src = item.image;

  // display / hide elements specific to questions or jobs
  if (item.description === undefined) { // if question else job
    // hide job buttons
    document.querySelector('#btn-shortlist').style.display = 'none';
    document.querySelector('#btn-dislike').style.display = 'none';
    document.querySelector('#btn-showLater').style.display = 'none';
    document.querySelector('#btn-like').style.display = 'none';
    document.querySelector('#show-more').style.display = 'none';
    document.querySelector('#show-less').style.display = 'none';

    // show question buttons
    document.querySelector('#btn-yes').style.display = '';
    document.querySelector('#btn-no').style.display = '';

    // set description to blank (as questions don't have descriptions)
    document.querySelector('#info-text').textContent = '';
  } else {
    // hide question buttons
    document.querySelector('#btn-yes').style.display = 'none';
    document.querySelector('#btn-no').style.display = 'none';

    // show job buttons
    document.querySelector('#btn-shortlist').style.display = '';
    document.querySelector('#btn-dislike').style.display = '';
    document.querySelector('#btn-showLater').style.display = '';
    document.querySelector('#btn-like').style.display = '';

    // show description
    dispInfoText(item.description);
  }
}

function dispTitle(titleText) {
  const titleEl = document.querySelector('#title');
  titleEl.textContent = titleText;

  // set title then fontsize to 2em, if title overflows decrease font size until no overflow
  let fontEm = 2;
  document.documentElement.style.setProperty('--title-fontsize', `${fontEm}em`);
  while (titleEl.clientHeight < titleEl.scrollHeight && fontEm > 0) {
    fontEm -= 0.1;
    document.documentElement.style.setProperty('--title-fontsize', `${fontEm}em`);
  }
}

function addELs() {
  // window.addEventListener('resize', setMainHeight);
  // window.addEventListener('resize', () => {
  //   displayItem(currentItem);
  // }); // automatic resizing with gets triggered by scrolling on mobile breaking viewmore (kept commented for devs)
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
  document.querySelector('#show-less').addEventListener('click', () => {
    displayItem(currentItem);
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
  const heightBffr = vpHeight / 20; // height buffer of 1/20 added to make space for URL bar on mobile
  const mainHeight = vpHeight - (navHeight + ftrHeight + heightBffr);

  // apply to swipe page
  document.documentElement.style.setProperty('--nav-height', `${navHeight}px`);
  document.documentElement.style.setProperty('--side-margin', `${sideMargin}px`);
  document.documentElement.style.setProperty('--ftr-height', `${ftrHeight}px`);
  document.documentElement.style.setProperty('--main-height', `${mainHeight}px`);
}

function getHeights() {
  // get required DOM elements
  const main = document.querySelector('#swipe-page');
  const swipeInfo = document.querySelector('#swipe-info');
  const infoText = document.querySelector('#info-text');

  // save starting height values
  main.dataset.origHeight = main.offsetHeight;
  swipeInfo.dataset.origHeight = swipeInfo.offsetHeight;
  infoText.dataset.origHeight = infoText.offsetHeight;
}

// start script (after page has loaded)

async function loadPage() {
  addELs(); // add Event Listeners
  setMainHeight();
  getHeights();
  await loadNextItem(); // await so buttons aren't displayed before being hidden
  document.querySelector('#swipe-btns').style.display = '';
}

window.addEventListener('load', loadPage);
