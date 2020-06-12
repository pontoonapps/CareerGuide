if (window.location.hostname === 'pontoonapps.com') {
  const userSelector = document.querySelector('#user-select');
  userSelector.parentElement.style.display = 'none';
} else {
  // use dummy auth selector
  const userSelector = document.querySelector('#user-select');
  userSelector.addEventListener('change', selectUser);
  userSelector.value = localStorage.getItem('dummy-user') || 'none';
  function selectUser() {
    const user = userSelector.value;
    localStorage.setItem('dummy-user', user);
    document.cookie = `PHPSESSID=${user}; path=/`;
  }
}

function gotoSwipePage() {
  window.location = 'nextjob.html';
}

async function checkLogin() {
  const reponse = await fetch('user/');
  if (reponse.status === 401) {
    const loginRequester = document.querySelector('#login-requester');
    const getStarted = document.querySelector('#get-started');
    const navBtn = document.querySelector('#nav-btn');
    loginRequester.style.display = '';
    getStarted.style.background = 'silver';
    getStarted.style.border = 'none';
    getStarted.style.pointerEvents = 'none';
    navBtn.style.background = 'silver';
    navBtn.style.pointerEvents = 'none';
  }
}

function init() {
  checkLogin();
  document.querySelector('#get-started').addEventListener('click', gotoSwipePage);
}

window.addEventListener('load', init);
