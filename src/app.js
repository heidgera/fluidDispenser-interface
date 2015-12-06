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

  // µ('hard-ware').onConnect = function() {
  //   for (var i = 1; i < 7; i++) {
  //     µ('#tube' + i).write(0);
  //   }
  // };

  µ('#auth').onData = function(val) {
    if (val) {
      authLockout = false;
      µ('#authLock').style.display = 'none';
      console.log('unlock');
    }
  };

    function touchHandler(event) {
        var first = event.changedTouches[0],
            type = "";
        switch(event.type)
        {
            case "touchstart": type = "mousedown"; break;
            case "touchmove":  type = "mousemove"; break;
            case "touchend":   type = "mouseup";   break;
            default:           return;
        }

        // initMouseEvent(type, canBubble, cancelable, view, clickCount,
        //                screenX, screenY, clientX, clientY, ctrlKey,
        //                altKey, shiftKey, metaKey, button, relatedTarget);

        var simulatedEvent = document.createEvent("MouseEvent");
        simulatedEvent.initMouseEvent(type, true, true, window, 1,
                                      first.screenX, first.screenY,
                                      first.clientX, first.clientY, false,
                                      false, false, false, 0/*left*/, null);

        first.target.dispatchEvent(simulatedEvent);
        event.preventDefault();
    }

    document.addEventListener("touchstart", touchHandler, true);
    document.addEventListener("touchmove", touchHandler, true);
    document.addEventListener("touchend", touchHandler, true);
    document.addEventListener("touchcancel", touchHandler, true);

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

  document.onkeydown = function(e) {
    var keyCode = (window.event) ? e.which : e.keyCode;
    if (keyCode === 8) {    // delete
      var fld = µ('.fld', curPrompt);
      fld.textContent = fld.textContent.substring(0, fld.textContent.length - 1);
      return false;
    } else if (keyCode === 13) {    // enter
      if (!authLockout) parseText();
      µ('#tube6').write(1);
      return false;
    } else if (keyCode === 40) {      // down arrow
      if (prevPrompt.nextSibling !== null) {
        prevPrompt = prevPrompt.nextSibling;
        µ('.fld', curPrompt).innerHTML = µ('.fld', prevPrompt).innerHTML;
      } else µ('.fld', curPrompt).innerHTML = '';
    } else if (keyCode === 38) {      // up arrow
      if (prevPrompt.previousSibling !== null && prevPrompt.previousSibling !== '') {
        console.log(prevPrompt.innerHTML);
        prevPrompt = prevPrompt.previousSibling;
        µ('.fld', curPrompt).innerHTML = µ('.fld', prevPrompt).innerHTML;
      }
    } else if (keyCode === 27) {  //escape
      e.preventDefault();
      console.log('here');

      //if (authLockout) {
      authLockout = false;
      µ('#authLock').style.display = 'none';

      //}
      return false;
    }

  };

  window.requestFullscreen();
});
