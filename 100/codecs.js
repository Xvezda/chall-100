function arrayToImageData(array, width) {
  var white = Array(4).fill(0xff);

  var flatten = array.flat();
  var length = flatten.length;

  // Padding
  for (var i = 0, m = width*4 - (length % (width*4)); i < m; ++i) {
    flatten.push(white);
  }
  var clamped = Uint8ClampedArray.from(flatten);
  return new ImageData(clamped, width);
}


function bytesToURL(bytes) {
  var array = new Uint8Array(bytes.length);
  bytes.forEach(function (byte, i) {
    array[i] = byte;
  });
  var blob = new Blob([array.buffer]);
  return URL.createObjectURL(blob);
}


/* NOTE:
 * Alpha should always be 255 (0xff),
 * Due to color-space issue of browser might leads
 * color approximation and becomes corrupted data.
 */
registerCodec('pixelheader', function (message, target) {
  var MAXSIZE = 0xffffff;

  var width = message.width;
  var array = message.data;
  var length = array.length;

  console.log('[WORKER] array:', array);

  var results = [];
  for (var i = 0; i < length; i += MAXSIZE) {
    var remain = length-i >= MAXSIZE ? MAXSIZE : length - i;
    results.push([
      (remain & (0xff<<16)) >>> 16,
      (remain & (0xff<<8)) >>> 8,
      (remain & (0xff)),
      255,
    ]);
    for (var j = 0; j < remain; j += 3) {
      var r = array[i+j],
          g = array[i+j + 1],
          b = array[i+j + 2];
      results.push([r || 0, g || 0, b || 0, 255]);

      target.postMessage({
        type: 'progress',
        percentage: Math.floor((i+j) / length * 100),
      });
    }
  }

  var image = arrayToImageData(results, width);
  console.log('[WORKER] image:', image);
  target.postMessage({
    type: 'done',
    image: image,
  });

}, function (message, target) {
  var bytes = [];
  var image = message.image;
  var width = image.width,
      height = image.height,
      data = image.data;
  var length = data.length;

  var header;
  var offset = 0;
  do {
    header = (data[offset] << 16) | (data[offset+1] << 8) | data[offset+2];
    offset += 4;

    for (var i = 0; i < header; ++i) {
      bytes.push(data[offset + i]);
      if ((i+1) % 4 === 0) {
        bytes.pop();
        ++header;
      }
      target.postMessage({
        type: 'progress',
        percentage: Math.floor((offset + i) / length * 100),
      });
    }
    offset += header * 3;
  } while (offset < length);

  var url = bytesToURL(bytes);
  target.postMessage({
    type: 'done',
    url: url,
  });
});

