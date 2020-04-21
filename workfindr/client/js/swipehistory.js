// swipeHistory.js

const data = {
  jobs: [{
    id: 0,
    title: 'Teacher',
    description: 'Can teach you how to do "X"',
    swipe: 'liked',
    image: 'img/tempimage.png',
  }, {
    id: 1,
    title: 'Plumber',
    description: 'Knows things about plumbing',
    swipe: 'liked',
    image: 'img/tempimage.png',
  }, {
    id: 2,
    title: 'Priest',
    description: 'Likes god',
    swipe: 'disliked',
    image: 'img/tempimage.png',
  }],
};

function loadSHistory(jobData) {
  const tmplt = document.querySelector('#swipe-history-template');
  for (const job of jobData.jobs) {
    const cont = document.importNode(tmplt.content, true);

    cont.querySelector('.swipeItemImg').src = job.image;
    cont.querySelector('.swipeItemImg').alt = job.title + 'image';
    cont.querySelector('.listItemTitle').textContent = job.title;
    cont.querySelector('.swipeItemDesc').textContent = job.description;
    cont.querySelector('.swipeChoice').classList.add(job.swipe);
    cont.querySelector('.swipeChoice').textContent = (job.swipe === 'liked' ? '👍' : '👎');

    const main = document.querySelector('main');
    main.appendChild(cont);
  }
}

function loadPage() {
  loadSHistory(data);
}

window.addEventListener('load', loadPage);
