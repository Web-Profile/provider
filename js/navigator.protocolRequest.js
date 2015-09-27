
(function(){

  var handlers = {};

  navigator.protocolRequest = function(protocol, obj){
    var transaction = {};
    transaction.data = obj;
    return new Promise(function(resolve, reject){
      handler = handlers[protocol] || establishConnection(protocol);
      var id = transaction.data.__prototcolRequestID__ = Math.random().toString(36).substr(2, 16);
      transaction.data.__protocolRequestType__ = protocol;
      transaction.resolve = resolve;
      transaction.reject = reject;
      handler.transactions[id] = transaction;
      messageFrame(handler, transaction);
    });
  }

  function establishConnection(protocol){
    var handler = handlers[protocol] = {
      protocol: protocol,
      transactions: {},
      connected: false
    };
    var frame = handler.frame = document.createElement('iframe');
        frame.style.position = 'absolute';
        frame.style.top = '-1px';
        frame.style.left = '-1px';
        frame.style.opacity = '0';
        frame.style.width = '0px';
        frame.style.height = '0px';
        frame.style.border = 'none';
        frame.onload = function(event){
          handler.connected = true;
          for (var z in handler.transactions) messageFrame(handler, handler.transactions[z]);
        }
    frame.src = protocol + ':#';
    document.body.appendChild(frame);
    return handler;
  }

  function messageFrame(handler, transaction){
    if (handler.connected && !transaction.posted) {
      handler.frame.contentWindow.postMessage(JSON.stringify(transaction.data), '*');
      transaction.posted = true;
    }
  }

  window.addEventListener('message', function(event){
    var data = JSON.parse(event.data);
    if (window == window.top && !window.opener) { // this is an indication the script is running in the host page
      handlers[data.__protocolRequestType__].transactions[data.__prototcolRequestID__].resolve(data.response);
    }
    else if (data.__prototcolRequestID__) { // this is for messages arriving in the frame
      var protocol = data.__protocolRequestType__;
      var id = data.__prototcolRequestID__;
      delete data.__protocolRequestType__;
      delete data.__prototcolRequestID__;
      fireEvent(window, 'protocolrequest', Object.create(data, {
        respond: {
          value: function(obj){
          obj.__protocolRequestType__ = protocol;
          obj.__prototcolRequestID__ = id;
          event.source.postMessage(JSON.stringify(obj), '*');
        }}
      }));
    }
  });

  function fireEvent(element, type, detail){
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent(type, false, false, detail);
    element.dispatchEvent(event);
  }

})();
