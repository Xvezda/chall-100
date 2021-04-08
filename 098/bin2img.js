window.onload = function (event) {
  var hash = location.hash;
  var matches = /([a-z_-][a-z0-9_-]+)=([^=]*)/gi.exec(hash) || [];
  var parameters = new Map();
  for (var i = 1; i < matches.length; i += 2) {
    parameters[matches[i]] = matches[i+1] || '';
  }

  if (parameters.mode) {
    document.querySelector(
      'input[name="mode"][value="' + parameters.mode + '"]').checked = true;
  }

  document.querySelectorAll('input[name="mode"]')
    .forEach(function (radio) {
      radio.addEventListener('click', function (evt) {
        location.hash = 'mode=' + evt.target.value;
      });
    });
};

var backend = new Worker('backend.js');
var pixelSize = getPixelSize();


function getMode() {
  return document.querySelector('input[name="mode"]:checked').value;
}


function getPixelSize() {
  return parseInt(document.querySelector('input[name="pixel-size"]').value);
}


function pixelSizeChanged(event) {
  pixelSize = getPixelSize();
}


var file;
function fileChanged(event) {
  var downloadBtn = document.getElementById('download');
  downloadBtn.removeAttribute('disabled');

  file = event.target.files[0];

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
}


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


var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');


function drawFile(file) {
  fileAsArray(file)
    .then(function (array) {
      console.log(array);
      backend.postMessage({
        type: 'encode',
        array: array,
        width: canvas.width,
        size: pixelSize,
      });

      return new Promise(function (resolve, reject) {
        backend.onmessage = resolve;
      });
    })
    .then(function (event) {
      canvas.height = event.data.height;
      event.data.results.forEach(function (data) {
        ctx.fillStyle = data.fill;
        ctx.fillRect(data.x, data.y, pixelSize, pixelSize);
      });
    })
    .catch(function (err) {
      console.error(err);
    });
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


function clickDownload() {
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
}


function downloadCanvas() {
  var dataURL = canvas.toDataURL('image/png');
  downloadURL(dataURL, file.name + '_bin2img.png');
}


function downloadURL(url, name) {
  var link = document.createElement('a');
  link.href = url;
  link.download = name || 'bin2img.bin';

  link.click();
}
