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

function disableNavigation(userType) {
  // disable nav bar links
  const navBarSlide = document.querySelector('#navbar-slide');

  navBarSlide.style.cursor = 'not-allowed';
  for (const link of document.querySelectorAll('#navbar-slide > a')) {
    if (link.id !== 'navbar-login-prompt') {
      link.removeAttribute('href'); // remove href to remove pointer cursor
      link.style.pointerEvents = 'none'; // remove pointer events so no highlighting on hover
      link.style.fontStyle = 'italic';
      link.style.color = 'silver';
    }
  }

  // disable get started button
  const getStarted = document.querySelector('#get-started');

  getStarted.style.background = 'silver';
  getStarted.style.border = 'none';
  getStarted.style.cursor = 'not-allowed';
  getStarted.removeAttribute('href');

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
    document.querySelector('h1').textContent = 'Something went wrong! Please refresh';
    disableNavigation();
    return false;
  }
}

function init() {
  shared.showLoadingLabel();
  shared.initNavbar();

  checkLogin(); // check login status and disable navbar if invalid
  shared.hideLoadingLabel(); // hide loading label and show main
}

window.addEventListener('load', init);
