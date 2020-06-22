let currentItem; // job being displayed on page

async function getNextItem() {
  const response = await fetch('user/next-item');
  if (response.ok) {
    const item = await response.json();
    return item;
  }

  if (response.status === 401) {
    // not logged in, redirect to home page
    window.location = './';
  } else {
    console.log('Error from server: ' + response.status + '. Could not get next item');
  }
}

function timeoutDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const BUTTON_DELAY = 500;

async function submitItem(event) {
  const delayPromise = timeoutDelay(BUTTON_DELAY);
  const answer = {};
  answer.itemId = currentItem.id;
  answer.choice = event.target.dataset.choice;

  // show the button is active
  event.target.classList.add('active-wait');

  // identify whether current item is job or question is there a better
  // way than a lack of description? should there be an attribute marking job or question?
  let response;
  if (currentItem.description_en === undefined) {
    response = await submitQuestionAnswer(answer);
  } else {
    response = await submitJobAnswer(answer);
  }

  await delayPromise;
  event.target.classList.remove('active-wait');

  // log if error connecting to server
  if (!response.ok) {
    document.querySelector('h1').textContent = 'Something went wrong! Please refresh';
    return false;
  }
  return true;
}

async function submitJobAnswer(answer) {
  const response = await fetch('user/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(answer),
  });
  return response;
}

async function submitQuestionAnswer(answer) {
  const response = await fetch('user/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(answer),
  });
  return response;
}

async function loadNextItem() {
  currentItem = await getNextItem();
  if (currentItem) displayItem(currentItem);
}

function displayInfoText(str) {
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
  document.documentElement.style.setProperty('--next-job-page-height', 'auto');
  document.documentElement.style.setProperty('--item-info-height', 'auto');
  document.documentElement.style.setProperty('--item-infotext-height', 'auto');

  // hide show more button and show show less button
  document.querySelector('#show-more').style.display = 'none';
  document.querySelector('#show-less').style.display = '';

  // display full length text
  document.querySelector('#info-text').textContent = currentItem.description_en;
}

function resetElHeights() {
  // get DOM elements
  const nextJobPage = document.querySelector('#next-job-page');
  const itemInfo = document.querySelector('#item-info');
  const infoText = document.querySelector('#info-text');

  // get original heights from dataset
  const nextJobPageHeight = nextJobPage.dataset.origHeight;
  const itemInfoHeight = itemInfo.dataset.origHeight;
  const infoTextHeight = infoText.dataset.origHeight;

  // set css variables to original heights
  document.documentElement.style.setProperty('--next-job-page-height', `${nextJobPageHeight}px`);
  document.documentElement.style.setProperty('--item-info-height', `${itemInfoHeight}px`);
  document.documentElement.style.setProperty('--item-infotext-height', `${infoTextHeight}px`);
}

function displayItem(item) {
  resetElHeights();
  displayTitle(item.title_en); // display info shared by questions and jobs (image and title)
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
    displayInfoText(item.question_en); // show question text

    // show question image
    document.querySelector('#item-image').src = 'img/question.jpg';
    document.querySelector('#item-image').alt = 'question image';
  } else {
    // show job buttons
    for (const jobButton of document.querySelectorAll('.job')) {
      jobButton.style.display = '';
    }
    displayInfoText(item.description_en); // show job description

    // show image
    document.querySelector('#item-image').src = 'img/' + item.image;
    document.querySelector('#item-image').alt = 'item image: ' + item.image;
  }
}

function displayTitle(titleText) {
  const titleEl = document.querySelector('#title');
  titleEl.textContent = titleText;

  // set title then fontsize to 2em, if title overflows decrease font size until no overflow
  let fontEm = 2;
  let overflowing = true;
  document.documentElement.style.setProperty('--title-fontsize', `${fontEm}em`);
  while (overflowing === true && fontEm > 0) {
    fontEm -= 0.1;
    document.documentElement.style.setProperty('--title-fontsize', `${fontEm}em`);
    if (titleEl.clientHeight === titleEl.scrollHeight && titleEl.clientWidth === titleEl.scrollWidth) {
      overflowing = false;
    }
  }
}

function addELs() {
  for (const button of document.querySelectorAll('.button, #btn-shortlist')) {
    button.addEventListener('click', async () => {
      if (await submitItem(event)) {
        loadNextItem();
      }
    });
  }
  window.addEventListener('resize', () => {
    setSwipePageHeight();
    getHeights();
  });
  document.querySelector('#show-more').addEventListener('click', expandInfoText);
  document.querySelector('#show-less').addEventListener('click', () => {
    displayItem(currentItem);
  });
}

function setSwipePageHeight() {
  // get required elements
  const nextJobPage = document.querySelector('#next-job-page');
  const navBar = document.querySelector('nav');

  // get display sizes
  const vpHeight = window.innerHeight; // viewport height
  const vpWidth = window.innerWidth; // viewport width
  const navHeight = navBar.offsetHeight;
  const nextJobPageWidth = nextJobPage.offsetWidth;
  const sideMargin = (vpWidth - nextJobPageWidth) / 2; // margin required to center nextJobPage
  const ftrHeight = 0; // TODO add footer
  const heightBffr = vpHeight / 20; // height buffer of 1/20 added to make space for URL bar on mobile
  const nextJobPageHeight = vpHeight - (navHeight + ftrHeight + heightBffr);

  // apply to next job page
  document.documentElement.style.setProperty('--nav-height', `${navHeight}px`);
  document.documentElement.style.setProperty('--side-margin', `${sideMargin}px`);
  document.documentElement.style.setProperty('--ftr-height', `${ftrHeight}px`);
  document.documentElement.style.setProperty('--next-job-page-height', `${nextJobPageHeight}px`);
}

function getHeights() {
  // get required DOM elements
  const nextJobPage = document.querySelector('#next-job-page');
  const itemInfo = document.querySelector('#item-info');
  const infoText = document.querySelector('#info-text');

  // save starting height values
  nextJobPage.dataset.origHeight = nextJobPage.offsetHeight;
  itemInfo.dataset.origHeight = itemInfo.offsetHeight;
  infoText.dataset.origHeight = infoText.offsetHeight;
}

function isDesktop() {
  if (navigator.userAgent.includes('Android')) return false;
  if (navigator.userAgent.includes('iPhone')) return false;
  if (navigator.userAgent.includes('Linux')) return true;
  if (navigator.userAgent.includes('Windows')) return true;
  if (navigator.userAgent.includes('Macintosh')) return true;
  // if unsure don't refresh on resize as this can cause bigger issues than display errors
  return false;
}

// start script (after page has loaded)

async function loadPage() {
  // display main before page load for setSwipePageHeight function
  document.querySelector('main').style.display = '';
  document.querySelector('#title').style.display = ''; // hide title to display loadingLabel

  addELs(); // add Event Listeners
  setSwipePageHeight();
  getHeights();
  await loadNextItem(); // await so buttons aren't displayed before being hidden

  document.querySelector('#loadingLabel').style.display = 'none'; // hide loadingLabel
  document.querySelector('#title').style.display = '';
  document.querySelector('#answer-btns').style.display = '';
  document.querySelector('main').style.display = '';
}

window.addEventListener('load', loadPage);
