
function createToast() {
  // add toast
  const toastElem = document.createElement('div');
  toastElem.classList.add('toast');
  toastElem.textContent = 'Saved';
  document.querySelector('main').appendChild(toastElem);
  return toastElem;
}

async function removeToast(toastElem) {
  // remove toast
  await timeoutDelay(3000);
  toastElem.remove();
}

function timeoutDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export {
  createToast,
  removeToast,
  timeoutDelay,
};
