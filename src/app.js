var localStore = null;
var hardwareJS = '';
if (window.isApp === true) {
  localStore = chrome.storage.local;
  hardwareJS = './hardwareApp.js';
} else {
  localStore  = localStorage;
  hardwareJS = './hardware.js';
}

include([hardwareJS, './config.js', 'src/dispenser.js'], function() {

  var authLockout = true;

  function timeString() {
    var time = new Date();

    var h = zeroPad(time.getHours(), 2);
    var m = zeroPad(time.getMinutes(), 2);
    var s = zeroPad(time.getSeconds(), 2);

    return h + ':' + m  + ':' + s;
  }

  µ('#complete').spin = µ('#wait', µ('#svgTemp').content).cloneNode(true);
  µ('div', µ('#complete')).appendChild(µ('#complete').spin);
  µ('#complete').spin.setAttribute('fill', '#333');
  µ('#complete').spin.setAttribute('stroke', '#aaa');
  µ('#complete').spin.style.width = '25%';
  µ('#complete').spin.style.left = '37.5%';

  function resetNext(num) {
    var key = 'dispense' + num;
    if (num < 7)
      µ('disp-enser:nth-child(' + num + ')').reset(function() {resetNext(num + 1);});
  }

  var authClock = null;

  µ('hard-ware').onReady = function() {
    if (authLockout) {
      authClock = setInterval(function() {
        µ('#auth').read();
      }, 500);
    }

    resetNext(1);
    µ('#cylinder').write(1);
  };

  µ('#auth').onData = function(val) {
    if (val) {
      authLockout = false;
      µ('#authLock').style.display = 'none';
      console.log('unlock');
      if (authClock) clearInterval(authClock);
      authClock = null;
    }
  };

  µ('#fullReset').onData = function(val) {
    if (val) {
      //resetNext(1);
      chrome.runtime.reload();

      //location.reload();
    }
  };

  function touchHandler(event) {
    var first = event.changedTouches[0],
        type = '';
    switch (event.type)
    {
      case 'touchstart': type = 'mousedown'; break;
      case 'touchmove':  type = 'mousemove'; break;
      case 'touchend':   type = 'mouseup';   break;
      default:           return;
    }

    // initMouseEvent(type, canBubble, cancelable, view, clickCount,
    //                screenX, screenY, clientX, clientY, ctrlKey,
    //                altKey, shiftKey, metaKey, button, relatedTarget);

    var simulatedEvent = document.createEvent('MouseEvent');
    simulatedEvent.initMouseEvent(type, true, true, window, 1,
                                  first.screenX, first.screenY,
                                  first.clientX, first.clientY, false,
                                  false, false, false, 0/*left*/, null);

    first.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
  }

  document.addEventListener('touchstart', touchHandler, true);
  document.addEventListener('touchmove', touchHandler, true);
  document.addEventListener('touchend', touchHandler, true);
  document.addEventListener('touchcancel', touchHandler, true);

  document.onkeypress = function(e) {

    e.preventDefault();
    var press = String.fromCharCode(e.keyCode);
    if (press == ' ') {
      console.log('release');
      µ('#cylinder').write(0);
    } else if (press == '=') {
      console.log('close');
      µ('#cylinder').write(1);
    }

  };

  var outputs = ['1', '2', '3', '4', '5', '6'];
  var resets = ['Q', 'W', 'E', 'R', 'T', 'Y'];
  var minReset = ['A', 'S', 'D', 'F', 'G', 'H'];
  var minTimers = {};

  document.onkeydown = function(e) {
    for (var i = 0; i < 6; i++) {
      if (String.fromCharCode(e.which) == outputs[i]) {
        µ('#reset' + (i + 1)).write(1);
        µ('#tube' + (i + 1)).write(0);
      } else if (String.fromCharCode(e.which) == resets[i]) {
        µ('#reset' + (i + 1)).write(0);
        µ('#tube' + (i + 1)).write(1);
      } else if (String.fromCharCode(e.which) == minReset[i]) {
        for (var j = 0; j < outputs.length; j++) {
          outputs[j].write(0);
        }
        µ('#reset' + (i + 1)).write(0);
        µ('#tube' + (i + 1)).write(1);
        minTimers[minReset[i]] = setTimeout(function() {
          µ('#tube' + (i + 1)).write(0);
        }, 60000);
      }
    }

    if (e.which == 27) {
      authLockout = false;
      µ('#authLock').style.display = 'none';
      console.log('unlock');
    }
  };

  document.onkeyup = function(e) {
    for (var i = 0; i < 6; i++) {
      if (String.fromCharCode(e.which) == outputs[i])
        µ('#tube' + (i + 1)).write(0);
      else if (String.fromCharCode(e.which) == resets[i])
        µ('#reset' + (i + 1)).write(0);
    }
  };
});
