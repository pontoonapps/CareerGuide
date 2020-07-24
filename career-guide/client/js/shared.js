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

/*
  This function checks if a page is empty (has no .list-item-container)
  and unhides #empty-page; if given any elementsToHide (array or Element)
  it hides those (display: none).
*/
export function checkEmptyPage(elementsToHide = []) {
  if (!Array.isArray(elementsToHide)) elementsToHide = [elementsToHide];

  if (document.querySelector('.list-item-container') == null) {
    // page is indeed empty
    document.querySelector('#empty-page').style.display = '';

    for (const el of elementsToHide) {
      el.style.display = 'none';
    }
  }
}

export function buttonDelay() {
  return timeoutDelay(250);
}

export function checkGuestLogin() {
  // TODO how to check for guest login?
  if (document.cookie.includes('pontoonapps_cg_guest')) {
    document.querySelector('#guest-notice').style.display = '';
    return true;
  }
  return false;
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

checkGuestLogin();
