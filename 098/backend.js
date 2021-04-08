self.onmessage = function (event) {
  var type = event.data.type;
  switch (type) {
    case 'encode':
      encodeArray(event.data);
      break;
    default:
      console.log('unhandled type:', type);
      break;
  }
  console.log('message from frontend:', event);
};


function encodeArray(data) {
  var array = data.array,
      size = data.size,
      width = data.width;

  var x, y;
  var i = 0;
  var results = [];
  // TODO: Make perfect rectangle (without alpha)
  outer: for (y = 0; ; y += size) {
    for (x = 0; x < data.width; x += size) {
      var r = array[i];
      var g = array[i+1];
      var b = array[i+2];

      if (r === undefined && g === undefined && b === undefined) {
        results.push({
          x: x,
          y: y,
          fill: 'rgba(0, 0, 0, 0)',
        });
        break outer;
      } else if (r === undefined || g === undefined || b === undefined) {
        var alpha = (((r && 1 || 0) << 2) |
                     ((g && 1 || 0) << 1) |
                      (b && 1 || 0)) / 10;
        results.push({
          x: x,
          y: y,
          fill: 'rgba(' + [r || 0, g || 0, b || 0, alpha].join(', ') + ')',
        });
      } else {
        results.push({
          x: x,
          y: y,
          fill: 'rgba(' +
            [r || 0, g || 0, b || 0, 1].join(', ') +
          ')',
        });
      }
      i += 3;
    }
  }
  self.postMessage({
    type: 'encoded',
    height: y + size,
    results: results,
  });
}
