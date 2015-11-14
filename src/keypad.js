function keypad() {
  var ret = µ('+div');
  for (var i = 1; i < 11; i++) {
    var next = µ('+div', ret);
    next.className = 'key';
    next.id = 'key' + i % 10;
    next.textContent = (i % 10).toString();
  }
}
