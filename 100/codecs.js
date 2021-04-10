registerCodec('eob', function (message, target) {
  var array = message.data;
  var width = message.width;
  var length = array.length;
  var results = [];

  var x;
  for (var i = 0, x = 0; i < length; i += 3, ++x) {
    var r = array[i],
        g = array[i+1],
        b = array[i+2];

    /**
     * Use alpha as indicator.
     *
     * Preserved alphas:
     *   0: End of bytes. (non of bytes are used)
     *   1: Full-width bytes. (means all of RGB values are used)
     *
     * if byte does not exactly divided by 3,
     * alpha becomes random value between .1 ~ .9
     * by the numbers of remaining bytes.
     *
     * Alpha range by remaining available bytes:
     *   R: .1 ~ .4
     *   R and G: .5 ~ .9
     */
    var alpha;
    if (g === undefined) {
      // .1 ~ .4
      alpha = '.' + Math.floor(Math.random()*4 + 1);
    } else if (b === undefined) {
      // .5 ~ .9
      alpha = '.' + Math.floor(Math.random()*5 + 5);
    } else {
      alpha = 1;
    }
    var fill = [r || 0, g || 0, b || 0, alpha * 255];

    target.postMessage({
      type: 'progress',
      percentage: Math.floor(i / length * 100),
    });
    results.push(fill);
  }
  var transparentBlack = Array(4).fill(0);
  results.push(transparentBlack);

  var flatten = results.flat();
  var length = flatten.length;

  // Padding
  for (var i = 0, m = width*4 - (length % (width*4)); i < m; ++i) {
    flatten.push(transparentBlack);
  }
  var clamped = Uint8ClampedArray.from(flatten);
  var image = new ImageData(clamped, width);

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
  var i = 0;
  outer: for (var y = 0; y < height; ++y) {
    for (var x = 0; x < width; ++x) {
      var r = data[i],
          g = data[i+1],
          b = data[i+2],
          a = data[i+3];
      if (r === 0 && g === 0 && b === 0 && a === 0)
        break outer;

      var percentage = a / 255;
      if (.1 <= percentage) {
        bytes.push(r);
      }
      if (.5 <= percentage) {
        bytes.push(g);
      }
      bytes.push(b);

      target.postMessage({
        type: 'progress',
        percentage: Math.floor(i / length * 100),
      });

      i += 4;
    }
  }

  var array = new Uint8Array(bytes.length);
  bytes.forEach(function (byte, i) {
    array[i] = byte;
  });
  var blob = new Blob([array.buffer]);
  console.log('blob:', blob);
  // var blob = new Blob([array.buffer], {type: 'application/octet-stream'});
  var url = URL.createObjectURL(blob);

  target.postMessage({
    type: 'done',
    url: url,
  });
});
