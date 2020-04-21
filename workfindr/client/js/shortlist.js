// shortlist.js

const data = {
  jobs: [{
    id: 0,
    title: 'Teacher',
    description: 'Can teach you how to do "X"',
    image: 'img/tempimage.png',
  }, {
    id: 1,
    title: 'Plumber',
    description: 'Knows things about plumbing',
    image: 'img/tempimage.png',
  }, {
    id: 2,
    title: 'Priest',
    description: 'Likes god',
    image: 'img/tempimage.png',
  }],
};

function loadSList(listData) {
  const tmplt = document.querySelector('#shortlist-template');
  for (const job of listData.jobs) {
    const cont = document.importNode(tmplt.content, true);

    cont.querySelector('.swipeItemImg').src = job.image;
    cont.querySelector('.swipeItemImg').alt = job.title + 'image';
    cont.querySelector('.listItemTitle').textContent = job.title;
    cont.querySelector('.swipeItemDesc').textContent = job.description;

    const main = document.querySelector('main');
    main.appendChild(cont);
  }
}

function loadPage() {
  loadSList(data);
}

window.addEventListener('load', loadPage);
