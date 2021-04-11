const URL = "https://cors-anywhere.herokuapp.com/www.imginn.com/hairstylist_ire/";
const INSTAGRAM_URL = "https://instagram.com";

const getJSON = (url, callback) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = () => {
      const status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
};

document.addEventListener('DOMContentLoaded', () => {
  // load instagram photos
  getJSON(URL, onReceiveInstagramPhotos);
  // Get all "navbar-burger" elements
  const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
  // Check if there are any navbar burgers
  if ($navbarBurgers.length > 0) {
    // Add a click event on each of them
    $navbarBurgers.forEach(el => {
      el.addEventListener('click', () => {
        // Get the target from the "data-target" attribute
        const target = el.dataset.target;
        const $target = document.getElementById(target);
        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        el.classList.toggle('is-active');
        $target.classList.toggle('is-active');
      });
    });
  }
});

const onReceiveInstagramPhotos = (err, resp) => {
  if (err == null) {
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(resp, "text/html");
    const htmlItems = htmlDoc.getElementsByClassName("item");
    const photos = Array.prototype.map.call(htmlItems, htmlItem => {
      const link = htmlItem.getElementsByTagName("a")[0];
      const href = link.getAttribute("href");
      const imageSrc = link.getElementsByTagName("img")[0].getAttribute("data-src");
      return {
        imageSrc: imageSrc,
        imageUrl: INSTAGRAM_URL + href
      };
    });
    addPhotosToHTML(photos.slice(0,6)); // grab first 6 photos
  } else {
    console.log(err, resp);
  }
};

const addPhotosToHTML = photos => {
  const fragment = document.createDocumentFragment();
  const photoColumns = photos.forEach(photo => {
    const img = document.createElement("img");
    img.setAttribute('src', photo.imageSrc);

    const aLink = document.createElement("a");
    aLink.setAttribute("href", photo.imageUrl);
    aLink.appendChild(img);

    const figure = document.createElement("figure");
    figure.classList.add("image", "is-square");
    figure.appendChild(aLink);
    
    const cardImage = document.createElement("div");
    cardImage.classList.add("card-image");
    cardImage.appendChild(figure);

    const card = document.createElement("div");
    card.classList.add("card");
    card.appendChild(cardImage);

    const column = document.createElement("div");
    column.classList.add("column", "is-4");
    column.appendChild(card);

    fragment.appendChild(column);
  });

  const instagramFeed = document.getElementById("instagram-feed");
  instagramFeed.appendChild(fragment);
};
