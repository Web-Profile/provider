
(function(){

  var connections = {}

  ProtocolWorker = function(protocol){
    Object.defineProperties(this, {
      protocol: { value: protocol }
    });
    return this;
  }

  ProtocolWorker.prototype.connect = function(){
    var worker = this;
    return new Promise(function(resolve, reject){
      connections[worker.protocol] ? resolve() : establishConnection(worker.protocol, worker, resolve, reject);
    });
  }

  ProtocolWorker.prototype.request = function(obj){
    createRequest(this.protocol, obj).then(function(response){ return response.data });
  }

  function establishConnection(protocol, worker, resolve, reject){
    var connection = connections[protocol] = {
      protocol: protocol,
      transactions: {},
      connected: false
    };
    var frame = connection.frame = document.createElement('iframe');
        frame.style.position = 'absolute';
        frame.style.top = '-1px';
        frame.style.left = '-1px';
        frame.style.opacity = '0';
        frame.style.width = '0px';
        frame.style.height = '0px';
        frame.style.border = 'none';
        frame.onload = function(event){
          createRequest(protocol, { __protocolConnect__: true }).then(function(response){
            connections[protocol].connected = true;
            Object.defineProperty(worker, 'provider', { value: response.__protocolProvider__ });
            resolve(response.data);
          }).catch(function(response){
            connections[protocol].connected = false;
            reject(response.data);
          });
        };
    frame.src = protocol + ':#';
    document.body.appendChild(frame);
    return connection;
  }

  function createRequest(protocol, obj){
    var transaction = {};
    transaction.data = obj || {};
    return new Promise(function(resolve, reject){
      connection = connections[protocol];
      var id = transaction.data.__protocolRequestID__ = Math.random().toString(36).substr(2, 16);
      transaction.data.__protocolRequestType__ = protocol;
      transaction.resolve = resolve;
      transaction.reject = reject;
      connection.transactions[id] = transaction;
      messageFrame(connection, transaction);
    });
  }

  function messageFrame(connection, transaction){
    if (!transaction.posted) {
      connection.frame.contentWindow.postMessage(JSON.stringify(transaction.data), '*');
      transaction.posted = true;
    }
  }

  var origins = {};
  window.addEventListener('message', function(event){
    var data = JSON.parse(event.data);
    if (window == window.top && !window.opener) { // this is an indication the script is running in the host page
      connections[data.__protocolRequestType__].transactions[data.__protocolRequestID__][data.status == 'success' ? 'resolve' : 'reject'](data);
    }
    else if (data.__protocolRequestID__) { // this is for messages arriving in the frame
      var protocol = data.__protocolRequestType__;
      var id = data.__protocolRequestID__;
      delete data.__protocolRequestType__;
      delete data.__protocolRequestID__;
      if (data.__protocolConnect__ && origins[event.origin] !== true) {
        fireEvent(window, 'protocolconnection', Object.create(data, {
          allow: {
            value: function(response){
              origins[event.origin] = true;
              var message = {
                data: response,
                __protocolProvider__: window.location.host
              }
              sendMessage('success', event, message, protocol, id);
          }},
          reject: {
            value: function(response){
              var message = { data: response };
              sendMessage('rejected', event, message, protocol, id);
          }}
        }));
      }
      else if (origins[event.origin]){
        fireEvent(window, 'protocolrequest', Object.create(data, {
          respond: {
            value: function(response){
              var message = { data: response };
              sendMessage('success', event, message, protocol, id);
          }},
          reject: {
            value: function(response){
              var message = { data: response };
              sendMessage('rejected', event, message, protocol, id);
          }}
        }));
      }
      else {
        sendMessage('rejected', event, { data: null }, protocol, id);
      }
    }
  });

  function sendMessage(status, event, message, protocol, id){
    message.__protocolRequestType__ = protocol;
    message.__protocolRequestID__ = id;
    message.status = status;
    event.source.postMessage(JSON.stringify(message), '*');
  }

  function fireEvent(element, type, detail){
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent(type, false, false, detail);
    element.dispatchEvent(event);
  }

})();
