include(['./hardware.js', './config.js','src/keypad.js'], function() {

  var authLockout = true;

  function timeString() {
    var time = new Date();

    var h = zeroPad(time.getHours(), 2);
    var m = zeroPad(time.getMinutes(), 2);
    var s = zeroPad(time.getSeconds(), 2);

    return h + ':' + m  + ':' + s;
  }

  var dir = null;
  var curPrompt = null;
  var resp = null;

  //µ('#console').innerHTML = timeString() + ' admin@local ' + dir + '\n$';

  function newPrompt() {
    var clone = µ('.cnsln', µ('#promptTemp').content).cloneNode(true);

    var tdir = dir;
    var path = '';
    while (tdir) {
      path = tdir.id + '/' + path;
      tdir = tdir.parentElement;
    }

    µ('.prompt', clone).innerHTML = timeString() + ' admin@local ' + path;
    return clone;
  }

  ajax('data/struct.xml', function(xml) {

    dir = xml.firstChild;

    /*curPrompt = newPrompt();
    µ('#console').appendChild(curPrompt);

    prevPrompt = curPrompt;*/
  });

  ajax('data/responses.html', function(xml) {
    resp = xml;
  });

  function writeFile(name, content) {
    var p = document.createElement('p');
    p.className = 'resp';

    var file = µ('#' + name, dir);
    if (file == null) {
      file = document.createElement('file');
      file.id = name;
      dir.appendChild(file);
      p.innerHTML = 'Created ' + name.replace('_', '.');

    } else {
      while (file.firstChild) {
        file.removeChild(file.firstChild);
      }

      p.innerHTML = 'Replaced ' + name.replace('_', '.');
    }

    if (typeof content == 'object') file.appendChild(content);
    else {
      var newP = document.createElement('p');
      newP.innerHTML = content;
      file.appendChild(newP);
    }

    µ('#console').appendChild(p);
  }

  function getArgs(str) {
    var ret = function() {};

    var spl = str.split(' ');
    for (var i = 0; i < spl.length; i++) {
      console.log(spl[i]);
      if (spl[i].charAt(0) == '-') {
        var wh = spl[i].substring(1);
        var cont = '';
        if (spl[++i].charAt(0) == '"') {
          cont += spl[i];
          while (cont.match(/"(.*?)"/) == null && i < spl.length - 1) {
            cont += ' ' + spl[++i];
          }

          if (cont.match(/"(.*?)"/).length == 0) cont = null;
          else cont = cont.substring(1, cont.length - 1);
        } else cont = spl[i];

        if (cont) ret[wh] = cont;
      }
    }

    return ret;
  }

  function hex2Txt(nm) {
    var str = '';
    var pees = µ('#' + nm, dir).querySelectorAll('p');
    for (var j = 0; j < pees.length; j++) {
      var txt = pees[j].innerHTML.split(':');
      if (txt.length > 1) txt = txt[1];
      for (var i = 0; i < txt.length; i++) {
        if (txt.charAt(i) != ' ' && txt.charAt(i) != '\n') {
          str = str + String.fromCharCode(parseInt(txt.substring(i, i + 2), 16));
          i++;
        }
      }
    }

    return str;
  }

  function nextPrompt() {
    if (curPrompt) µ('.cursor', curPrompt).style.display = 'none';
    curPrompt = newPrompt();
    prevPrompt = curPrompt;
    µ('#console').appendChild(curPrompt);

    µ('body').scrollTop = µ('body').scrollHeight;
  }

  function parseText() {
    var txt = µ('.fld', curPrompt).textContent.replace(/\xa0/g, ' ');

    var spl = txt.split(' ');
    switch (spl[0]){
      case 'help':
        console.log(µ('.help', resp));
        µ('#console').appendChild(µ('.help', resp).cloneNode(true));
        nextPrompt();
        break;
      case 'cd':
        if (spl.length > 1) {
          if (spl[1]) {
            var path = spl[1].split('/');
            for (var i = 0; i < path.length; i++) {
              if (path[i].length) {
                if (path[i] == '..') {
                  if (dir.parentElement) dir = dir.parentElement;
                } else if (µ('#' + path[i], dir) && µ('#' + path[i], dir).tagName == 'folder') {
                  dir = µ('#' + path[i], dir);
                } else µ('#console').appendChild(µ('.noDir', resp).cloneNode(true));
              }
            }
          } else µ('#console').appendChild(µ('.noDir', resp).cloneNode(true));
        } else µ('#console').appendChild(µ('.cdHelp', resp).cloneNode(true));

        nextPrompt();
        break;
      case 'ls':
        var conts = dir.children;
        for (var i = 0; i < conts.length; i++) {
          var t = document.createElement('p');
          t.className = 'resp';
          t.innerHTML = conts[i].id.replace('_', '.');
          µ('#console').appendChild(t);
        }

        nextPrompt();
        break;
      case 'display':
        if (spl.length > 1) {
          var nm = spl[1].replace('.', '_');
          if (µ('#' + nm, dir)) {
            var p = document.createElement('p');
            p.className = 'resp';
            p.innerHTML = µ('#' + nm, dir).innerHTML;
            µ('#console').appendChild(p);
          } else µ('#console').appendChild(µ('.noDir', resp).cloneNode(true));
        } else µ('#console').appendChild(µ('.displayHelp', resp).cloneNode(true));
        nextPrompt();
        break;
      case 'dispense':
        var args = getArgs(txt.substring(9));
        if (args.f) {
          args.f = args.f.replace('.', '_');
          var ext = args.f.split('_')[1];
          if (ext == null || ext != 'hex') {
            µ('#console').appendChild(µ('.wrongFile', resp).cloneNode(true));
            nextPrompt();
            return;
          }

          if (µ('#' + args.f, dir)) {
            var val = hex2Txt(args.f).split('=');
            if (val.length > 1) {
              var wh = val[0];
              var time = parseFloat(val[1]);
              console.log(time);
              if (µ('#' + wh) && time > 0 && time < 60) {
                µ('#' + wh).write(1);
                µ('#console').appendChild(µ('.dispensing', resp).cloneNode(true));
                setTimeout(function() {
                  µ('#' + wh).write(0);
                  nextPrompt();
                }, time * 1000);

                return;
              } else µ('#console').appendChild(µ('.invalid', resp).cloneNode(true));
            } else µ('#console').appendChild(µ('.invalid', resp).cloneNode(true));
          } else µ('#console').appendChild(µ('.noDir', resp).cloneNode(true));
        } else µ('#console').appendChild(µ('.dispHelp', resp).cloneNode(true));
        nextPrompt();
        break;
      case 'write':
        var args = getArgs(txt.substring(6));
        if (args.c && args.f) {
          console.log(args.c);
          writeFile(args.f.replace('.', '_'), args.c);
        } else µ('#console').appendChild(µ('.writeHelp', resp).cloneNode(true));
        nextPrompt();
        break;
      case 'convert':
        if (spl.length > 1) {
          var nm = spl[1].replace('.', '_');
          if (µ('#' + nm, dir)) {
            var ext = nm.split('_')[1];
            if (ext == 'hex') {
              var str = hex2Txt(nm);

              writeFile(nm.replace('hex', 'txt'), str);
            } else if (ext == 'txt') {
              var txt = '';

              //µ('#' + nm, dir).innerHTML;
              var pees = µ('#' + nm, dir).querySelectorAll('p');
              for (var i = 0; i < pees.length; i++) {
                txt += pees[i].innerHTML + ' ';
              }

              var cont = document.createElement('div');
              var p = null;
              for (var i = 0; i < txt.length; i++) {
                if (i % 16 == 0) {
                  if (p) cont.appendChild(p);
                  p = document.createElement('p');
                  p.textContent = zeroPad(Math.floor(i / 16), 8) + ':';
                }

                if (i % 2 == 0) p.textContent += ' ';
                if (txt.charCodeAt(i) >= 32)
                  p.textContent += txt.charCodeAt(i).toString(16);
              }

              if (p) cont.appendChild(p);
              console.log(cont);
              writeFile(nm.replace('txt', 'hex'), cont);
            }
          } else µ('#console').appendChild(µ('.noDir', resp).cloneNode(true));
        }

        nextPrompt();
        break;
      default:
        µ('#console').appendChild(µ('.unrecognized', resp).cloneNode(true));
        nextPrompt();
        break;

    }
  }

  //set the canvas to redraw at 30fps
  //setInterval(function() {}, 1000 / 30);

  // Set up key listeners (for debug w/o Arduino)
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
    } else if (keyCode === 27) {
      if (authLockout) {
        authLockout = false;
        µ('#console').appendChild(µ('.welcome', resp).cloneNode(true));
        nextPrompt();
      }
    }

  };
});
