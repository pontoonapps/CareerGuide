function showNav() {
  document.querySelector('#navbar-slide').classList.add('active');
}

function hideNav() {
  document.querySelector('#navbar-slide').classList.remove('active');
}

function toggleNav() {
  if (document.querySelector('#navbar-slide').classList.contains('active')) {
    hideNav();
  } else {
    showNav();
  }
}

function clickOffNav() {
  const navBtn = document.querySelector('#nav-btn');
  if (event.target !== navBtn) {
    hideNav();
  }
}

function initPage() {
  document.querySelector('#nav-btn').addEventListener('click', toggleNav);
  document.addEventListener('click', clickOffNav);

  initLoading();
}

function initLoading() {
  // hide main content and display loading
  document.querySelector('main').style.display = 'none';
  const loadingLabel = document.createElement('h1');
  loadingLabel.textContent = 'Loading';
  loadingLabel.id = 'loadingLabel';
  document.querySelector('body').appendChild(loadingLabel);
}

function hideLoadingMessage() {
  document.querySelector('#loadingLabel').style.display = 'none';
  document.querySelector('#title').style.display = '';
  document.querySelector('main').style.display = '';
}

const TOAST_FADE_DELAY = 3000;

async function createToast() {
  // add toast
  const toastElem = document.createElement('div');
  toastElem.classList.add('toast');
  toastElem.textContent = 'Saved';
  document.querySelector('main').appendChild(toastElem);
  await timeoutDelay(TOAST_FADE_DELAY);
  toastElem.remove();
}

const BUTTON_DELAY = 250;

function buttonDelay() {
  return timeoutDelay(BUTTON_DELAY);
}

function timeoutDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function checkEmptyPage() {
  if (document.querySelector('.list-item-container') == null) {
    document.querySelector('#empty-page').style.display = '';
  }
}

export {
  createToast,
  initPage,
  hideLoadingMessage,
  checkEmptyPage,
  buttonDelay,
};
