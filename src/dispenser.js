include(['src/keypad.js'], function() {
  var dispenser = inheritFrom(HTMLElement, function() {
    this.createdCallback = function() {
      var _this = this;

      //grab attributes from the tag.
      this.code = µ('|>code', this);
      this.color = µ('|>color', this);

      //this.stroke = µ('|>stroke', this);
      this.fill = µ('|>fill', this);
      this.output = µ('#' + µ('|>output', this));
      this.time = µ('|>time', this);
      this.attempts = 10;
      this.done = false;
      this.dispensing = false;

      this.failTime = 30;
      this.fail = false;

      /*var svgs = null;

      ajax('data/svg.xml', function(xml) {
        _this.appendChild(µ('#beaker', xml).cloneNode(true));
      });*/

      //////////////////////////////
      // Create each of the sub divs

      //make it be the button itself.
      this.button = µ('+div', this);
      this.button.className = 'select block ' + this.color;

      var beaker = µ('#beaker', µ('#svgTemp').content).cloneNode(true);
      beaker.setAttribute('fill', µ('con-fig')[_this.color].fill);
      beaker.setAttribute('stroke', µ('con-fig')[_this.color].hex);
      this.button.appendChild(beaker);

      var dim = µ('+div', this.button);
      dim.className = 'dim over';

      this.name = µ('+div', dim);
      for (var i = 0; i < this.id.length; i++) {
        if (this.id.charCodeAt(i) >= 48 && this.id.charCodeAt(i) <= 57)
          this.name.innerHTML += '<sub>' + this.id.charAt(i) + '</sub>';
        else this.name.innerHTML += this.id.charAt(i);
      }

      this.name.className = 'formula';
      this.tries = µ('+div', dim);
      this.tries.className = 'attempts';

      //make the interface div
      this.face = µ('+div', this);
      this.face.className = 'interface block ' + this.color;

      //make the keypad and push into interface
      this.keypad = new keypad(this.color);
      this.face.appendChild(this.keypad);

      //text box to hold keypresses
      this.text = µ('+div', this.face);
      this.text.className = 'textBox block ' + this.color;

      //Make the submit button
      this.submit = µ('+div', this.face);
      this.submit.className = 'submit block ' + this.color;
      this.submit.textContent = 'ENTER';

      //create the instruction div
      this.instruct = µ('+div', this.face);
      this.instruct.className = 'instruct ' + this.color;
      this.instruct.textContent = 'Enter passcode on the keypad';

      //create the return button
      this.ret = µ('+div', this.face);
      this.ret.className = 'retBut block ' + this.color;
      this.ret.textContent = '<- RETURN';

      //create the dialog box
      var fade = µ('+div', this);
      fade.className = 'overlay';
      this.dialog = µ('+div', fade);
      this.dialog.className = 'dialog block ' + this.color;
      this.dialog.spin = µ('#wait', µ('#svgTemp').content).cloneNode(true);
      this.dialog.appendChild(this.dialog.spin);
      this.dialog.spin.setAttribute('fill', µ('con-fig')[_this.color].fill);
      this.dialog.spin.setAttribute('stroke', µ('con-fig')[_this.color].hex);
      this.dialog.text = µ('+p', this.dialog);
      this.dialog.text.textContent = 'Dispensing, please wait...';

      this.button.onmousedown = function(e) {
        e.preventDefault();
        _this.open();
      };

      this.open = function() {
        if (!_this.done)
          this.face.style.display = 'block';
      };

      this.close = function() {
        this.face.style.display = 'none';
      };

      var failTimer = null;

      this.failCount = function(time) {
        if (time > 0) {
          var sec = (time == 1) ? ' second' : ' seconds';
          _this.instruct.textContent = 'Verification failed; retry in ' + time + sec;
          _this.tries.textContent = 'Wait ' + time + sec;
          if (failTimer) clearTimeout(failTimer);
          failTimer = setTimeout(function() {_this.failCount(time - 1);}, 1000);
        } else {
          _this.fail = false;
          _this.instruct.textContent = 'System Ready; Enter Passcode';
          _this.tries.textContent = 'Ready';
          _this.attempts = 2;
        }
      };

      this.check = function() {
        if (this.keypad.input == this.code) {
          this.instruct.textContent = 'Dispensing...';
          _this.dispense();
        } else {
          _this.text.textContent = this.keypad.input = '';
          if (--this.attempts >= 1) {
            var atmp = (this.attempts == 1) ? ' attempt remains' : ' attempts remain';
            this.instruct.textContent = 'Invalid code; ' + this.attempts + atmp;
            this.tries.textContent = this.attempts + atmp;
          } else {
            _this.fail = true;
            this.failCount(3);
          }
        }
      };

      this.dispense = function() {
        fade.style.display = 'block';
        _this.dispensing = true;

        _this.output.write(1);
        setTimeout(function() {
          _this.dispensing = false;
          _this.done = true;
          fade.style.display = 'none';
          _this.instruct.textContent = 'Finished dispensing.';

          //_this.name.textContent =  'COMPLETE';
          //_this.name.className = 'done';

          var t = µ('+div', _this.button);
          t.className = 'over';
          var chck = µ('#check', µ('#svgTemp').content).cloneNode(true);
          chck.style.width = 'auto';
          chck.style.height = '90%';
          chck.setAttribute('fill', µ('con-fig')[_this.color].fill);
          chck.setAttribute('stroke', µ('con-fig')[_this.color].hex);
          t.appendChild(chck);

          _this.submit.style.opacity = '.25';

          var disps = document.querySelectorAll('disp-enser');
          var done = true;
          for (var i = 0; i < disps.length; i++) {
            done = disps[i].done && done;
          }

          if (done) {
            _this.close();
            µ('#complete').style.display = 'block';
            setTimeout(function() {
              µ('div', µ('#complete')).innerHTML = '';
              µ('div', µ('#complete')).textContent = 'Process Complete';
            }, 3000);
          }

          _this.output.write(0);
        }, this.time);
      };

      this.keypad.onChange = function() {
        _this.text.textContent = _this.keypad.input;
      };

      this.submit.onmousedown = function(e) {
        e.preventDefault();
        if (!(_this.done || _this.dispensing || _this.fail)) {
          this.clicked = true;
          this.style.backgroundColor = µ('con-fig')[_this.color].hex;
          this.style.color = '#000';
          _this.check();
        }
      };

      this.submit.onmouseout = this.submit.onmouseup = function() {
        if (this.clicked && !this.dispensing) {
          this.clicked = false;
          this.style.color = µ('con-fig')[_this.color].hex;
          this.style.backgroundColor = '#000';
        }
      };

      this.ret.onmousedown = function(e) {
        e.preventDefault();
        _this.close();
      };

    };
  });

  document.registerElement('disp-enser', dispenser);
});
