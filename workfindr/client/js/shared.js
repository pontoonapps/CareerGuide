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

function init() {
  document.querySelector('#nav-btn').addEventListener('click', toggleNav);
  document.addEventListener('click', clickOffNav);
}

function loadingAnimation() {
  const loadingLabel = document.querySelector('#loadingLabel');
  if (loadingLabel.textContent.length < 10) {
    loadingLabel.textContent += '.';
  } else {
    loadingLabel.textContent = 'Loading';
  }

  if (loadingLabel.style.display === 'none') {
    clearInterval(loadingLabel.dataset.intervalId);
  }
}

// hide main content and display loading
document.querySelector('main').style.display = 'none';
const loadingLabel = document.createElement('h1');
loadingLabel.textContent = 'Loading';
loadingLabel.id = 'loadingLabel';
loadingLabel.src = 'img/loading.gif';
document.querySelector('body').appendChild(loadingLabel);
loadingLabel.dataset.intervalId = setInterval(loadingAnimation, 500);

window.addEventListener('load', init);
