// shared.js

function showNav() {
  document.querySelector('#navbar-slide').classList.toggle('active');
}

function init() {
  document.querySelector('#nav-btn').addEventListener('click', showNav);
}

window.addEventListener('load', init);
