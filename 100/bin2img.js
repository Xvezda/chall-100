;(function (global, document) {

var backend = createWorker(),
    canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d'),
    progress = document.getElementById('progress');

var widthSlider = document.getElementById('canvas-width');
var downloadBtn = document.getElementById('download');
var cancelBtn = document.getElementById('cancel');

var file;

window.onload = function (event) {
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


function debounce(callback, time) {
  var timeout;
  return function () {
    var _arguments = arguments;

    clearTimeout(timeout);
    timeout = setTimeout(function () {
      callback.apply(null, _arguments);
    }, time);
  };
}


function throttle(callback) {
  var ticking = false;
  return function () {
    var _arguments = arguments;

    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        callback.apply(null, _arguments);
      });
    }
  };
}


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


function getPixelSize() {
  return parseInt(document.querySelector('input[name="pixel-size"]').value);
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
      backend.postMessage({
        type: 'encode',
        method: 'eob',
        width: canvas.width,
        array: array,
      });

      showProgress();
      lockUI();

      cancelBtn.removeAttribute('disabled');

      var length = array.length;
      var progressThrottle = throttle(setProgress);

      backend.onmessage = function (event) {
        var message = event.data;
        switch (message.type) {
          case 'progress':
            progressThrottle(Math.floor(message.index / length * 100));
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

/*
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
      // console.dir(img);
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      var bytes = [];
      outer: for (var y = 0; y < canvas.height; y += pixelSize) {
        for (var x = 0; x < canvas.width; x += pixelSize) {
          var pixel = ctx.getImageData(x, y, 1, 1);
          var data = pixel.data;
          var alpha = data[3];
          if (alpha === 0) break outer;

          var percentage = alpha / 255;
          // 0.1
          if (0 < percentage) {
            bytes.push(data[0]);
          }
          // 0.3
          if (.3 <= percentage) {
            bytes.push(data[1]);
          }
          // 0.7
          bytes.push(data[2]);
        }
      }

      var array = new Uint8Array(bytes.length);
      bytes.forEach(function (byte, i) {
        array[i] = byte;
      });
      var blob = new Blob([array.buffer], {type: 'application/octet-stream'});
      var url = URL.createObjectURL(blob);
      downloadURL(url, file.name + '_bin2img.bin');
    })
    .catch(function (err) {
      console.error(err);
    });
}
*/

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
  var dataURL = canvas.toDataURL('image/png');
  downloadURL(dataURL, file.name + '_bin2img.png');
}


function downloadURL(url, name) {
  var link = document.createElement('a');
  link.href = url;
  link.download = name;

  link.click();
}

// End of IIFE
})(window, document);

