let currentItem; // job being displayed on page

async function getNextItem() {
  const response = await fetch('user/next-item');
  if (response.ok) {
    const item = await response.json();
    return item;
  } else {
    console.log('Error from server: ' + response.status + '. Could not get next swipe item');
  }
}

async function subSwipe(event) {
  const swipe = {};
  swipe.itemId = currentItem.id;
  swipe.choice = event.target.dataset.choice;

  // identify whether current item is job or question is there a better
  // way than a lack of description? should there be an attribute marking job or question?
  let response;
  if (currentItem.description_en === undefined) {
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
  const response = await fetch('user/jobs', {
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
  document.documentElement.style.setProperty('--swipe-page-height', 'auto');
  document.documentElement.style.setProperty('--swipe-info-height', 'auto');
  document.documentElement.style.setProperty('--swipe-infotext-height', 'auto');

  // hide show more button and show show less button
  document.querySelector('#show-more').style.display = 'none';
  document.querySelector('#show-less').style.display = '';

  // display full length text
  document.querySelector('#info-text').textContent = currentItem.description_en;
}

function resetElHeights() {
  // get DOM elements
  const swipePage = document.querySelector('#swipe-page');
  const swipeInfo = document.querySelector('#swipe-info');
  const infoText = document.querySelector('#info-text');

  // get original heights from dataset
  const swipePageHeight = swipePage.dataset.origHeight;
  const swipeInfoHeight = swipeInfo.dataset.origHeight;
  const infoTextHeight = infoText.dataset.origHeight;

  // set css variables to original heights
  document.documentElement.style.setProperty('--swipe-page-height', `${swipePageHeight}px`);
  document.documentElement.style.setProperty('--swipe-info-height', `${swipeInfoHeight}px`);
  document.documentElement.style.setProperty('--swipe-infotext-height', `${infoTextHeight}px`);
}

function displayItem(item) {
  resetElHeights();
  dispTitle(item.title_en); // display info shared by questions and jobs (image and title)
  for (const button of document.querySelectorAll('button')) { // hide buttons
    button.style.display = 'none';
  }

  if (item.description_en === undefined) { // if question else job
    // show option buttons and add option number to dataset
    let buttonIndex = 0;
    for (const option of item.options) {
      const button = document.querySelectorAll('.question')[buttonIndex];
      button.style.display = '';
      button.textContent = option.label_en;
      button.dataset.choice = option.option_number;
      buttonIndex += 1;
    }
    dispInfoText(item.question_en); // show question text

    // show question image
    document.querySelector('#swipe-image').src = 'img/question.jpg';
    document.querySelector('#swipe-image').alt = 'question image';
  } else {
    // show job buttons
    for (const jobButton of document.querySelectorAll('.job')) {
      jobButton.style.display = '';
    }
    dispInfoText(item.description_en); // show job description

    // show image
    document.querySelector('#swipe-image').src = 'img/' + item.image;
    document.querySelector('#swipe-image').alt = 'item image: ' + item.image;
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
  for (const button of document.querySelectorAll('.button')) {
    button.addEventListener('click', async () => {
      if (await subSwipe(event)) {
        loadNextItem();
      }
    });
  }
  document.querySelector('#show-more').addEventListener('click', expandInfoText);
  document.querySelector('#show-less').addEventListener('click', () => {
    displayItem(currentItem);
  });
}

function setSwipePageHeight() {
  // get required elements
  const swipePage = document.querySelector('#swipe-page');
  const navBar = document.querySelector('nav');

  // get display sizes
  const vpHeight = window.innerHeight; // viewport height
  const vpWidth = window.innerWidth; // viewport width
  const navHeight = navBar.offsetHeight;
  const swipePageWidth = swipePage.offsetWidth;
  const sideMargin = (vpWidth - swipePageWidth) / 2; // margin required to center swipePage
  const ftrHeight = 0; // TODO add footer
  const heightBffr = vpHeight / 20; // height buffer of 1/20 added to make space for URL bar on mobile
  const swipePageHeight = vpHeight - (navHeight + ftrHeight + heightBffr);

  // apply to swipe page
  document.documentElement.style.setProperty('--nav-height', `${navHeight}px`);
  document.documentElement.style.setProperty('--side-margin', `${sideMargin}px`);
  document.documentElement.style.setProperty('--ftr-height', `${ftrHeight}px`);
  document.documentElement.style.setProperty('--swipe-page-height', `${swipePageHeight}px`);
}

function getHeights() {
  // get required DOM elements
  const swipePage = document.querySelector('#swipe-page');
  const swipeInfo = document.querySelector('#swipe-info');
  const infoText = document.querySelector('#info-text');

  // save starting height values
  swipePage.dataset.origHeight = swipePage.offsetHeight;
  swipeInfo.dataset.origHeight = swipeInfo.offsetHeight;
  infoText.dataset.origHeight = infoText.offsetHeight;
}

async function checkLogin() {
  const reponse = await fetch('user/');
  if (reponse.status === 401) {
    window.location = './';
  }
}

// start script (after page has loaded)

async function loadPage() {
  addELs(); // add Event Listeners
  setSwipePageHeight();
  getHeights();
  checkLogin();
  await loadNextItem(); // await so buttons aren't displayed before being hidden
  document.querySelector('#swipe-btns').style.display = '';
}

window.addEventListener('load', loadPage);
