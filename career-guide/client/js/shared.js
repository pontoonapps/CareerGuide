export async function createToast() {
  const toastElem = document.createElement('div');
  toastElem.classList.add('toast');
  toastElem.textContent = 'Saved';
  document.querySelector('main').appendChild(toastElem);
  await timeoutDelay(3000);
  toastElem.remove();
}

export function initNavbar() {
  document.querySelector('#nav-btn').addEventListener('click', toggleNav);
  document.addEventListener('click', clickOffNav);
}

export function showLoadingLabel() {
  // hide main content and display loading
  document.querySelector('main').style.display = 'none';
  const loadingLabel = document.createElement('h1');
  loadingLabel.textContent = 'Loading';
  loadingLabel.id = 'loadingLabel';
  document.querySelector('body').appendChild(loadingLabel);
}

export function hideLoadingLabel() {
  document.querySelector('#loadingLabel').style.display = 'none';
  document.querySelector('#title').style.display = '';
  document.querySelector('main').style.display = '';
}

function checkEmptyPage() {
  return (document.querySelector('.list-item-container') == null);
}

/*
  This function checks if a page is empty:
    If empty, it takes the parameters you passed, doesn't matter if it's an
    array or single objects, it'll hide them all.
*/
export function isEmptyPage() {
  if (checkEmptyPage()) {
    document.querySelector('#empty-page').style.display = '';
    for (const param of arguments) {
      if (Array.isArray(param)) {
        for (const obj of param) {
          obj.style.display = 'none';
        }
      } else param.style.display = 'none';
    }
  }
}

export function buttonDelay() {
  return timeoutDelay(250);
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
