import * as shared from './shared.js';
// this code (until the next comment) will go when we no longer need dummy auth

function enableUserSelector() {
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
}

// keep the following code:

function disableNavigation() {
  // disable nav bar links
  const navBarSlide = document.querySelector('#navbar-slide');

  navBarSlide.style.cursor = 'not-allowed';
  for (const link of document.querySelectorAll('#navbar-slide > a')) {
    if (!link.classList.contains('visible-when-logged-out')) {
      link.removeAttribute('href'); // remove href to remove pointer cursor
      link.style.pointerEvents = 'none'; // remove pointer events so no highlighting on hover
      link.style.fontStyle = 'italic';
      link.style.color = 'silver';
    } else {
      link.style.display = '';
    }
  }

  // disable get started button
  const getStarted = document.querySelector('#get-started');

  getStarted.style.background = 'silver';
  getStarted.style.border = 'none';
  getStarted.style.cursor = 'not-allowed';
  getStarted.removeAttribute('href');
}

async function createGuest() {
  const response = await fetch('guest-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (response.ok) {
    window.location.reload();
  } else {
    shared.errorTitle();
  }
}

async function logoutGuest(event) {
  event.stopPropagation();

  const response = await fetch('guest-logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (response.ok) {
    window.location.reload();
  } else {
    shared.errorTitle();
  }
}

async function showUserTypeInfo() {
  const loginStatus = await shared.getLoginStatus();
  if (!loginStatus) {
    disableNavigation();

    // show that the user must log in
    document.querySelector('#login-requester').style.display = '';
    return;
  }

  // pontoonapps.com recruiters and admins don't have ID in login info, they cannot use career guide
  if (loginStatus.user.id == null) {
    disableNavigation();
    document.querySelector('#login-requester').style.display = '';
    document.querySelector('#login-admin').style.display = '';
    return;
  }

  if (loginStatus.user.guest) {
    document.querySelector('#guest-login-info').style.display = '';
    document.querySelector('#guest-notice').style.display = '';
  }

  // for normal logged-in user, we don't need to show anything
}

function hideLogoutGuest() {
  const logoutGuestBtn = document.querySelector('#logout-guest');
  const confirmLogoutGuestBtn = document.querySelector('#confirm-logout-guest');
  logoutGuestBtn.style.display = '';
  confirmLogoutGuestBtn.style.display = 'none';
}

function confirmLogoutGuest(event) {
  event.stopPropagation();
  const logoutGuestBtn = document.querySelector('#logout-guest');
  const confirmLogoutGuestBtn = document.querySelector('#confirm-logout-guest');
  logoutGuestBtn.style.display = 'none';
  confirmLogoutGuestBtn.style.display = '';
}

async function init() {
  enableUserSelector();

  shared.showLoadingLabel();
  shared.initNavbar();
  await showUserTypeInfo();

  document.querySelector('#guest-login').addEventListener('click', createGuest);
  document.querySelector('#logout-guest').addEventListener('click', confirmLogoutGuest);
  document.querySelector('#confirm-logout-guest').addEventListener('click', logoutGuest);

  // if we're showing the button to confirm guest logout, clicking anywhere else will hide it again
  // the event listeners above stop their click event propagating to hideLogoutGuest
  document.addEventListener('click', hideLogoutGuest);

  shared.hideLoadingLabel(); // hide loading label and show main
}

window.addEventListener('load', init);
