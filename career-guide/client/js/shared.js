export async function createToast() {
  const toastElem = document.createElement('div');
  toastElem.classList.add('toast');
  bothLanguages(toastElem, 'Saved', 'Sauvegardé');
  document.querySelector('main').appendChild(toastElem);
  await timeoutDelay(3000);
  toastElem.remove();
}

export function initNavbar() {
  document.querySelector('#nav-btn').addEventListener('click', toggleNav);
  document.addEventListener('click', clickOffNav);

  const currentLanguageEnglishBtn = document.querySelector('#set-language-english');
  const currentLanguageFrenchBtn = document.querySelector('#set-language-french');
  currentLanguageEnglishBtn.addEventListener('click', changeLanguage);
  currentLanguageFrenchBtn.addEventListener('click', changeLanguage);
}

function changeLanguage(event) {
  // the french title and english titles are kept in the dataset of the title tag
  // alternatively a global variable could be used in the HTML script tag
  const title = document.querySelector('title');
  switch (event.target.id) {
    case 'set-language-french':
      // if current language is english, change to french
      document.querySelector('body').classList.remove('in-english');
      document.querySelector('body').classList.add('in-french');
      title.textContent = title.dataset.frenchTitle;
      localStorage.setItem('PONTOON_CG_LANG', 'french');
      break;
    case 'set-language-english':
      // if current language is french, change to english
      document.querySelector('body').classList.remove('in-french');
      document.querySelector('body').classList.add('in-english');
      title.textContent = title.dataset.englishTitle;
      localStorage.setItem('PONTOON_CG_LANG', 'english');
      break;
  }
  document.dispatchEvent(new Event('language-changed'));
}

// set the French and English text in a given container element;
// this assumes the container only contains this text.
export function bothLanguages(container, englishText, frenchText) {
  if (typeof container === 'string') {
    container = document.querySelector(container);
  }

  // empty the container
  container.textContent = '';

  const englishSpan = document.createElement('span');
  const frenchSpan = document.createElement('span');

  englishSpan.textContent = englishText;
  frenchSpan.textContent = frenchText;

  englishSpan.classList.add('english');
  frenchSpan.classList.add('french');

  container.appendChild(englishSpan);
  container.appendChild(frenchSpan);
}

export function showLoadingLabel() {
  // hide main content and display loading
  document.querySelector('main').style.display = 'none';
  const loadingLabel = document.createElement('h1');
  bothLanguages(loadingLabel, 'Loading', 'Chargement');
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

// show you're a guest, or redirect to main page if you're not logged in at all
export async function checkLogin() {
  const loginStatus = await getLoginStatus();

  if (loginStatus.user.guest) {
    document.querySelector('#guest-notice').style.display = '';
  }

  if (loginStatus.user.id == null) {
    // if the user isn't logged in, redirect them to the main page
    window.location = './';
  }
}

export async function getLoginStatus() {
  const response = await fetch('user-id');
  if (response.ok) {
    const userType = await response.json();
    if (userType.user == null) { // return false if not logged in
      return false;
    } else {
      return userType;
    }
  } else {
    console.error('error getting user information', response);
    errorTitle();
    return false;
  }
}

export function errorTitle() {
  bothLanguages('h1', 'Something went wrong! Please refresh', 'Un problème est survenu ! Rechargez la page!');
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
