import * as shared from './shared.js';
// this code (until the next comment) will go when we no longer need dummy auth

const userSelector = document.querySelector('#user-select');

if (window.location.hostname === 'pontoonapps.com') {
  userSelector.parentElement.style.display = 'none';
} else {
  // use dummy auth selector
  userSelector.addEventListener('change', selectUser);
  userSelector.value = localStorage.getItem('dummy-user') || 'none';
}

function selectUser() {
  const user = userSelector.value;
  localStorage.setItem('dummy-user', user);
  document.cookie = `PHPSESSID=${user}; path=/`;
}

// keep the following code:

function gotoNextJobPage() {
  window.location = 'nextjob.html';
}

function disableNavigation(userType) {
  // disable nav bar buttons
  const navBarSlide = document.querySelector('#navbar-slide');

  navBarSlide.style.cursor = 'not-allowed';
  for (const link of document.querySelectorAll('#navbar-slide > ul > li')) {
    link.lastChild.removeAttribute('href'); // remove href to remove pointer cursor
    link.style.pointerEvents = 'none';
    link.lastChild.style.fontStyle = 'italic';
    link.lastChild.style.color = 'silver';
  }

  // disable get started button and reset account button
  const resetAccount = document.querySelector('#reset-account');
  const getStarted = document.querySelector('#get-started');
  const splashBtns = [resetAccount, getStarted];

  splashBtns.forEach((btn) => {
    btn.style.background = 'silver';
    btn.style.border = 'none';
    btn.style.cursor = 'not-allowed';
  });
  getStarted.removeEventListener('click', gotoNextJobPage);

  document.querySelector('#navbar-login-prompt').style.display = '';

  // show that the user needs to log in
  document.querySelector('#login-requester').style.display = '';

  if (userType && userType.id == null) {
    document.querySelector('#login-admin').style.display = '';
  }
}

async function checkLogin() {
  const response = await fetch('user-id');
  if (response.ok) {
    const userType = await response.json();
    if (userType.user == null || userType.user.id == null) {
      disableNavigation(userType.user);
      return false;
    }
    return true;
  } else {
    console.error('error getting user information', response);
    disableNavigation();
    return false;
  }
}

async function init() {
  shared.showLoadingLabel();
  shared.initNavbar();
  const goodLogin = await checkLogin();

  // hide loading label and show main
  shared.hideLoadingLabel();

  if (goodLogin) {
    document.querySelector('#get-started').addEventListener('click', gotoNextJobPage);
  }
}

window.addEventListener('load', init);
