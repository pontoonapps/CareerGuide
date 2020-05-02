// shared.js

// TODO currently, after opening the nav bar only closes after clicking the nav-btn. Should it close when clicking anywhere outside the nav bar?
function showNav() {
  document.querySelector('#navbar-slide').classList.toggle('active');
}

function init() {
  document.querySelector('#nav-btn').addEventListener('click', showNav);
}

window.addEventListener('load', init);
