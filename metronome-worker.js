var MIN_IN_MS = 60 * 1000;

var loop = null,
    count = 0,
    bpm = 120;


self.onmessage = function (evt) {
  switch (evt.data.type) {
    case 'init':
      bpm = (isNaN(evt.data.bpm) || evt.data.bpm < 1) ? 120 : evt.data.bpm;
      if (loop) return;
      loop = startLoop();
      break;
    case 'updatebpm':
      console.assert(evt.data.bpm);
      bpm = evt.data.bpm;
      break;
    case 'stop':
      clearTimeout(loop);
      loop = null
      count = 0;
      break;
    default:
      console.log('uncaught event:', event);
      break;
  }
};


function startLoop() {
  // Immediate message
  self.postMessage({
    type: 'tick',
    count: count % 4,
    totalCount: count,
  });
  ++count;

  return loop = setTimeout(startLoop, Math.floor(MIN_IN_MS / bpm));
}
