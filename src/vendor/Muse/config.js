var configFile = inheritFrom(HTMLElement, function() {
  this.loaded = false;
  this.onLoad = function() {};

  function objectify(node, parentObj) {
    var kids = node.children;
    for (var i = 0; i < kids.length; i++) {
      var type = kids[i].getAttribute('type');
      if (type == 'num') {
        parentObj[kids[i].tagName] = parseFloat(kids[i].textContent);
      } else if (type == 'object') {
        parentObj[kids[i].tagName] = {};
        objectify(kids[i], parentObj[kids[i].tagName]);
      } else parentObj[kids[i].tagName] = kids[i].textContent;
    }
  }

  this.createdCallback = function() {
    var _this = this;
    _this.loaded = true;
    var fileAddress = this.getAttribute('file');
    ajax(fileAddress, function(xml) {
      objectify(xml.firstChild, _this);
      _this.onLoad();
    });
  };
});

document.registerElement('con-fig', configFile);
