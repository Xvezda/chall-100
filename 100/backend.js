var codecs = new Map();

function getCodec(name) {
  return codecs[name] || {};
}


function registerCodec(name, encoder, decoder) {
  codecs[name] = {
    encoder: encoder,
    decoder: decoder,
  };
}

function importCodec(name) {
  importScripts(name);
}

importCodec('codecs.js');


self.onmessage = function (event) {
  console.log('message from frontend:', event);

  var message = event.data,
      type = message.type;
  var codec = getCodec(message.method);
  if (!codec) {
    return self.postMessage({
      type: 'notfound',
    });
  }
  switch (type) {
    case 'encode':
      codec.encoder.call(null, message, self);
      break;
    case 'decode':
      codec.decoder.call(null, message, self);
      break;
    default:
      console.log('unhandled type:', type);
      break;
  }
};


