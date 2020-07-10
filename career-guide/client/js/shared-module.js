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
};
