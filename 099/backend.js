var encodeMethods = new Map();
var decodeMethods = new Map();

function getEncoder(name) {
  return encodeMethods[name] || new Function;
}


function registerEncoder(name, func) {
  encodeMethods[name] = func;
}


// End-of-byte encoding
registerEncoder('eob', function (data) {
  var array = data.array;
  var results = [];

  var x;
  for (var i = 0, x = 0; i < array.length; i += 3, ++x) {
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
    var fill = 'rgba(' + [r || 0, g || 0, b || 0, alpha].join(',') + ')';
    // var fill = [r || 0, g || 0, b || 0, alpha * 255];

    self.postMessage({
      type: 'progress',
      index: i,
    });
    results.push(fill);
  }
  results.push('rgba(0,0,0,0)');
  // results.push([0, 0, 0, 0]);

  self.postMessage({
    type: 'done',
    results: results,
  });
});


self.onmessage = function (event) {
  console.log('message from frontend:', event);

  var encoder,
      decoder;

  var message = event.data;
  var type = message.type;
  switch (type) {
    case 'encode':
      encoder = getEncoder(message.method);
      if (!encoder) break;
      encoder.call(self, message);
      break;
    default:
      console.log('unhandled type:', type);
      break;
  }
};


