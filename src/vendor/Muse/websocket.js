include([], function() {

  var websocket = function() {
    this.address = 'ws://' + window.location.host + '/';
    this.connectInterval = null;
    this.serialport = '';
    var ws = null;
    this.messageCallback = function(evt) {};

    this.connectCallback = function() {};

    this.send = function(msg) {};

    this.connect = function() {
      var _this = this;
      if ('WebSocket' in window) {
        ws = new WebSocket(this.address);
        ws.onopen = function()
        {
          // Web Socket is connected, send data using send()
          clearInterval(_this.connectInterval);
          _this.connectCallback();
          ws.onmessage = function(evt) {
            _this.messageCallback(evt);
          };
        };

        ws.onerror = function(error) {
          //if ('WebSocket' in window) _this.connectInterval = setInterval(_this.connect.bind(_this),2000);
        };

        ws.onclose = function() {
          //_this.connectInterval = setInterval(_this.connect.bind(_this),2000);
        };

        this.send = function(msg) {
          ws.send(msg);
        };
      }    else {
        clearInterval(_this.connectInterval);
        console.log('Websocket not supported');
      }
    };
  };

  window.wsClient = new websocket();
});
