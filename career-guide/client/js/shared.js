export const shared = defineSharedFunctions();

function defineSharedFunctions() {
  const shared = {};

  shared.createToast = async function () {
    const toastElem = document.createElement('div');
    toastElem.classList.add('toast');
    toastElem.textContent = 'Saved';
    document.querySelector('main').appendChild(toastElem);
    await timeoutDelay(3000);
    toastElem.remove();
  };

  shared.initNavbar = function () {
    document.querySelector('#nav-btn').addEventListener('click', toggleNav);
    document.addEventListener('click', clickOffNav);
  };

  shared.showLoadingLabel = function () {
    // hide main content and display loading
    document.querySelector('main').style.display = 'none';
    const loadingLabel = document.createElement('h1');
    loadingLabel.textContent = 'Loading';
    loadingLabel.id = 'loadingLabel';
    document.querySelector('body').appendChild(loadingLabel);
  };

  shared.hideLoadingLabel = function () {
    document.querySelector('#loadingLabel').style.display = 'none';
    document.querySelector('#title').style.display = '';
    document.querySelector('main').style.display = '';
  };

  shared.checkEmptyPage = function () {
    if (document.querySelector('.list-item-container') == null) {
      document.querySelector('#empty-page').style.display = '';
    }
  };

  shared.buttonDelay = function () {
    return timeoutDelay(250);
  };

  return shared;
}

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

function timeoutDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
