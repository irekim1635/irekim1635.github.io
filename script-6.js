
document.addEventListener('DOMContentLoaded', () => {
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
  hidePlaceholderImages();
});

const clearForm = () => {

};

const formSubmit = async () => {
  if (!validateForm()) {
    alert('Please fill out entire form');
    return;
  }

  const {
    customerName,
    customerPhone,
    customerServiceRequest,
    customerAvailabilities,
    customerHairType,
    customerHairLength,
    customerHairHistory,
    customerMessage
  } = parseFormData();

  const form = new FormData();
  form.append("c-name", customerName);
  form.append("c-phone", customerPhone);
  form.append("c-service", customerServiceRequest);
  form.append("c-availabilities", customerAvailabilities);
  form.append("c-hairtype", customerHairType);
  form.append("c-hairlength", customerHairLength);
  form.append("c-history", customerHairHistory);
  form.append("c-message", customerMessage);

  if (compressedCurrentPhoto) {
    form.append("c-photo-current", compressedCurrentPhoto, "c-photo-current.jpg");
  }

  if (compressedDesiredPhoto) {
    form.append("c-photo-desired", compressedDesiredPhoto, "c-photo-desired.jpg");
  }
  
  console.log(form);
  const response = await fetch('https://us-west2-agapehair-307621.cloudfunctions.net/form-upload', {
    method: 'POST',
    body: form
  });
  const result = await response.json();
  if (result.statusCode === 200) {
    alert('Form submitted!');
  } else {
    alert('Error submitting form, please call or try again later');
  }
};

const validateForm = () => {
  return true; // always true
};

const parseFormData = () => {

  const combinedAvailabilities = [...document.querySelectorAll('input[name="availability"]:checked')].map(x=>x.value).join(', ');
  const hairPhotoUrl = 'parseAndCompressImage()';
  const hairDesiredUrl = 'parseAndCompressImage()';

  return {
    customerName: (document.querySelector('#c-name') || {} ).value,
    customerPhone: (document.querySelector('#c-phone') || {} ).value,
    customerServiceRequest: (document.querySelector('#c-service') || {} ).value,
    customerAvailabilities: combinedAvailabilities,
    customerHairType: (document.querySelector('input[name="hairtype"]:checked') || {} ).value,
    customerHairLength: (document.querySelector('input[name="hairlength"]:checked') || {} ).value,
    customerHairHistory: (document.querySelector('#c-history') || {} ).value,
    customerMessage: (document.querySelector('#c-message') || {} ).value
  };
};

let compressedCurrentPhoto;
let compressedDesiredPhoto;
const prepareImage = (event, outputId, callback) => {
  const reader = new FileReader();
  reader.onload = () => {
    const output = document.getElementById(outputId);
    output.src = reader.result;
    showPlaceholderImage(outputId);
  }
  reader.readAsDataURL(event.target.files[0]);
  resizeImage({
    file: event.target.files[0],
    maxSize: 500
  }).then(function(resizedImage) {
    resizedImage.name = outputId;
    callback(resizedImage);
  }).catch(function(error) {
    console.log(error);
    alert('file is not an image!');
  });
};

const prepareCurrentPhoto = (event, outputId) => {
  compressedCurrentPhoto = prepareImage(event, outputId, (resizedImage) => {
    compressedCurrentPhoto = resizedImage;
    console.log(compressedCurrentPhoto);
  });
};

const prepareDesiredPhoto = async (event, outputId) => {
  compressedDesiredPhoto = await prepareImage(event, outputId, (resizedImage) => {
    compressedDesiredPhoto = resizedImage;
    console.log(compressedDesiredPhoto);
  });
};

const hidePlaceholderImages = () => {
  const currentPhotoPlaceholder = document.getElementById("output-image-current");
  const desiredPhotoPlaceholder = document.getElementById("output-image-desired");
  
  currentPhotoPlaceholder.style.display = "none";
  desiredPhotoPlaceholder.style.display = "none";
};

const showPlaceholderImage = (id) => {
  const placeHolder = document.getElementById(id);
  placeHolder.style.display = "";
};

// Taken from: https://stackoverflow.com/questions/23945494/use-html5-to-resize-an-image-before-upload/39235724#39235724
var resizeImage = function (settings) {
    var file = settings.file;
    var maxSize = settings.maxSize;
    var reader = new FileReader();
    var image = new Image();
    var canvas = document.createElement('canvas');
    var dataURItoBlob = function (dataURI) {
        var bytes = dataURI.split(',')[0].indexOf('base64') >= 0 ?
            atob(dataURI.split(',')[1]) :
            unescape(dataURI.split(',')[1]);
        var mime = dataURI.split(',')[0].split(':')[1].split(';')[0];
        var max = bytes.length;
        var ia = new Uint8Array(max);
        for (var i = 0; i < max; i++)
            ia[i] = bytes.charCodeAt(i);
        return new Blob([ia], { type: mime });
    };
    var resize = function () {
        var width = image.width;
        var height = image.height;
        if (width > height) {
            if (width > maxSize) {
                height *= maxSize / width;
                width = maxSize;
            }
        } else {
            if (height > maxSize) {
                width *= maxSize / height;
                height = maxSize;
            }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(image, 0, 0, width, height);
        var dataUrl = canvas.toDataURL('image/jpeg');
        return dataURItoBlob(dataUrl);
    };
    return new Promise(function (ok, no) {
        if (!file.type.match(/image.*/)) {
            no(new Error("Not an image"));
            return;
        }
        reader.onload = function (readerEvent) {
            image.onload = function () { return ok(resize()); };
            image.src = readerEvent.target.result;
        };
        reader.readAsDataURL(file);
    });
};
