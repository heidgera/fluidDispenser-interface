include(['./hardware.js', './config.js', 'src/dispenser.js'], function() {

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
      console.log('here');

      //if (authLockout) {
      //  authLockout = false;
      µ('#authLock').style.display = 'none';

      //}
    }

  };
});
