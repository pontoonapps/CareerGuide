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

function disableNavbar() {
  const navBarSlide = document.querySelector('#navbar-slide');

  navBarSlide.style.cursor = 'not-allowed';
  for (const link of document.querySelectorAll('#navbar-slide > li')) {
    link.lastChild.removeAttribute('href'); // remove href to remove pointer cursor
    link.style.pointerEvents = 'none';
    link.lastChild.style.fontStyle = 'italic';
    link.lastChild.style.color = 'silver';
  }

  // show login warning
  const navLogin = document.createElement('a');
  navLogin.textContent = 'Please log in to access these pages';
  navLogin.classList.add('navbar-slide-item');
  navLogin.style.fontWeight = 'bold';
  navLogin.style.cursor = 'pointer';
  navLogin.href = 'https://pontoonapps.com/login.php';
  navBarSlide.appendChild(navLogin);
}

function disableGetStarted() {
  const getStarted = document.querySelector('#get-started');

  getStarted.style.background = 'silver';
  getStarted.style.border = 'none';
  getStarted.style.pointerEvents = 'none';
}

async function checkLogin() {
  const response = await fetch('user-id');
  if (response.ok) {
    const userType = await response.json();
    if (userType.user === undefined) { // TODO check if this works with recruiters
      document.querySelector('#login-requester').style.display = ''; // display loginRequester
      disableGetStarted(); // disable get started button
      disableNavbar(); // disable navbar
    }
  }
}

async function init() {
  await checkLogin();

  // hide loading label and show main
  document.querySelector('main').style.display = '';
  document.querySelector('#loadingLabel').style.display = 'none';

  document.querySelector('#get-started').addEventListener('click', gotoNextJobPage);
}

window.addEventListener('load', init);
