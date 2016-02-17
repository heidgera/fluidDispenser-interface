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
    localStore.get('dispense' + num, function(resp) {
      if (resp['dispense' + num]) {
        µ('disp-enser[output=' + i + ']').reset(resetNext(num + 1));
      } else if (num < 7) resetNext(num + 1);
    });
  }

  µ('hard-ware').onConnect = function() {
    var i = 1;
    resetNext(1);
    µ('#release').write(0)
  };

  µ('#auth').onData = function(val) {
    if (val) {
      authLockout = false;
      µ('#authLock').style.display = 'none';
      console.log('unlock');
    }
  };

  µ('#fullReset').onData = function(val) {
    if (val) {
      resetNext(1);
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
    var keyCode = (window.event) ? e.which : e.keyCode;

    if (keyCode >= 32 && keyCode <= 126) {            // 'a' = Screen activity button
      if (keyCode == 32) keyCode = 160, console.log('space');;
      if (curPrompt) {
        var fld = µ('.fld', curPrompt);
        var newChar = String.fromCharCode(keyCode);
        fld.textContent = fld.textContent + newChar;
      }

    }

  };

  var outputs = ['1', '2', '3', '4', '5', '6'];
  var resets = ['Q', 'W', 'E', 'R', 'T', 'Y'];

  document.onkeydown = function(e) {
    for (var i = 0; i < 6; i++) {
      if (String.fromCharCode(e.which) == outputs[i]) {
        µ('#reset' + (i + 1)).write(1);
        µ('#tube' + (i + 1)).write(0);
      } else if (String.fromCharCode(e.which) == resets[i]) {
        µ('#reset' + (i + 1)).write(0);
        µ('#tube' + (i + 1)).write(1);
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
      µ('#reset' + (i + 1)).write(0);
      µ('#tube' + (i + 1)).write(0);
    }
  };
});
