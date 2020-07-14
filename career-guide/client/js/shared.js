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

function initNav() {
  document.querySelector('#nav-btn').addEventListener('click', toggleNav);
  document.addEventListener('click', clickOffNav);

  // hide main content and display loading
  document.querySelector('main').style.display = 'none';
  const loadingLabel = document.createElement('h1');
  loadingLabel.textContent = 'Loading';
  loadingLabel.id = 'loadingLabel';
  document.querySelector('body').appendChild(loadingLabel);
}

async function createToast() {
  // add toast
  const toastElem = document.createElement('div');
  toastElem.classList.add('toast');
  toastElem.textContent = 'Saved';
  document.querySelector('main').appendChild(toastElem);
  await new Promise(resolve => setTimeout(resolve, 3000));
  toastElem.remove();
}

export {
  createToast,
  initNav,
};
