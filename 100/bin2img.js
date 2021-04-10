;(function (global, document) {

var backend = createWorker(),
    canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d', {alpha: false}),
    progress = document.getElementById('progress');

var widthSlider = document.getElementById('canvas-width');
var downloadBtn = document.getElementById('download');
var cancelBtn = document.getElementById('cancel');

var file;

window.onload = function (event) {
  ctx.mozImageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.msImageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;

  var hash = location.hash;
  var matches = /([a-z_-][a-z0-9_-]+)=([^=]*)/gi.exec(hash) || [];
  var parameters = new Map();
  for (var i = 1; i < matches.length; i += 2) {
    parameters[matches[i]] = matches[i+1] || '';
  }

  if (parameters.mode) {
    var modeSelector = 'input[name="mode"][value="' + parameters.mode + '"]';
    document.querySelector(modeSelector).checked = true;
  }

  document.querySelectorAll('input[name="mode"]')
    .forEach(function (radio) {
      radio.addEventListener('click', function (evt) {
        location.hash = '!mode=' + evt.target.value;
      });
    });
};


function createWorker() {
  return new Worker('backend.js');
}


function showProgress() {
  progress.classList.remove('hide');
}


function setProgress(percentage) {
  var bar = progress.querySelector('.bar');
  bar.style.transform = 'scaleX(' + (percentage / 100) + ')';
}


function hideProgress() {
  progress.classList.add('hide');
}


function lockUI() {
  document.querySelectorAll('input:not(#cancel)')
    .forEach(function (input) {
      input.setAttribute('disabled', 'disabled');
    });
}

function unlockUI() {
  document.querySelectorAll('input:not(#cancel)')
    .forEach(function (input) {
      input.removeAttribute('disabled');
    });
}


function getMode() {
  return document.querySelector('input[name="mode"]:checked').value;
}


function getMethod() {
  return document.getElementById('method').value;
}


global.fileChanged = function (event) {
  file = event.target.files[0];
  if (!file) return;

  var mode = getMode();
  switch (mode) {
    case 'encode':
      drawFile(file);
      break;
    case 'decode':
      decodeFile(file);
      break;
    default:
      console.log('unhandled case:', mode);
      break;
  }
};


global.widthChanged = function (event) {
  canvas.width = +event.target.value;
};


function readFile(file) {
  var reader = new FileReader();
  return new Promise(function (resolve, reject) {
    reader.onload = resolve;
    reader.onerror = reject;

    reader.readAsArrayBuffer(file);
  });
}


function fileAsArray(file) {
  return new Promise(function (resolve, reject) {
    readFile(file)
      .then(function (progress) {
        resolve(new Uint8Array(progress.target.result));
      })
      .catch(function (err) {
        console.error(err);
      });
  });
}


function drawFile(file) {
  fileAsArray(file)
    .then(function (array) {
      showProgress();
      lockUI();

      cancelBtn.removeAttribute('disabled');

      var progressThrottle = throttle(setProgress, 20, {type: 'rAF'});

      backend.onmessage = function (event) {
        var message = event.data;
        switch (message.type) {
          case 'progress':
            progressThrottle(message.percentage);
            break;
          case 'done':
            hideProgress();
            setProgress(0);

            unlockUI();
            cancelBtn.setAttribute('disabled', 'disabled');

            draw(message.image);
            break;
          default:
            break;
        }
      };

      backend.postMessage({
        type: 'encode',
        method: 'pixelheader',
        width: canvas.width,
        data: array,
      });

    })
    .catch(function (err) {
      console.error(err);
    });
}


function draw(image) {
  canvas.width = image.width;
  canvas.height = image.height;

  ctx.putImageData(image, 0, 0);
}


function decodeFile(file) {
  if (!file.type.startsWith('image/')) {
    alert('file type must be an image');
    return;
  }

  var img;
  new Promise(function (resolve, reject) {
    img = new Image();
    img.onload = resolve;
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  })
    .then(function () {
      // Fit canvas size to image
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      showProgress();
      lockUI();

      cancelBtn.removeAttribute('disabled');

      var progressThrottle = throttle(setProgress, 20, {type: 'rAF'});

      backend.onmessage = function (event) {
        var message = event.data;
        switch (message.type) {
          case 'progress':
            progressThrottle(message.percentage);
            break;
          case 'done':
            hideProgress();
            setProgress(0);

            unlockUI();
            cancelBtn.setAttribute('disabled', 'disabled');

            downloadURL(message.url, file.name + '.bin2img.bin');
            break;
          default:
            break;
        }
      };

      backend.postMessage({
        type: 'decode',
        method: 'pixelheader',
        image: ctx.getImageData(0, 0, canvas.width, canvas.height),
      });
    })
    .catch(function (err) {
      console.error(err);
    });
}


global.clickCancel = function (event) {
  backend.terminate();
  backend = createWorker();

  event.target.setAttribute('disabled', 'disabled');

  hideProgress();
  setProgress(0);

  unlockUI();
};


global.clickDownload = function () {
  var mode = getMode();
  switch (mode) {
    case 'encode':
      downloadCanvas();
      break;
    case 'decode':
      break;
    default:
      alert('unexpected mode selected:', mode);
      break;
  }
};


function downloadCanvas() {
  canvas.toBlob(function (blob) {
    downloadURL(URL.createObjectURL(blob), file.name + '.bin2img.png');
  });
}


function downloadURL(url, name) {
  var link = document.createElement('a');
  document.body.appendChild(link);

  link.href = url;
  link.download = name;

  link.click();
  link.addEventListener('click', function () {
    link.remove();
    setTimeout(function () {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error(e);
      }
    }, 1000);
  }, {capture: false, once: true});
}

// End of IIFE
})(window, document);
