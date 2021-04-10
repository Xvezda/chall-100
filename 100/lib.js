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


function throttle(callback, time, options) {
  var timer;
  var type = options && options.type;
  switch (type) {
    case 'rAF':
      timer = requestAnimationFrame;
      break;
    default:
      timer = setTimeout;
      break;
  }
  var immediate = options && options.immediate;

  var ticking = false;
  return function () {
    var _arguments = arguments;

    if (!ticking) {
      ticking = true;
      if (immediate) {
        callback.apply(null, _arguments);
      }
      timer(function () {
        ticking = false;
        if (!immediate) {
          callback.apply(null, _arguments);
        }
      }, time || 16);
    }
  };
}



