var tryRequire = require('try-require')
var $ = require('dombo')

var electron = tryRequire('electron')
var remote = electron ? electron.remote : tryRequire('remote')

var mouseConstructor = tryRequire('osx-mouse') || tryRequire('win-mouse')

var supported = !!mouseConstructor
var noop = function () { return noop }

var drag = function(element) {
	element = $(element);

	var offset = null;
	var win = null;
	var size = null;
	var mouse = mouseConstructor();
  var isResizable
	var onmousedown = function(e) {
		win = remote.getCurrentWindow();
		offset = [e.clientX, e.clientY];
		size = win.getSize();
    isResizable = win.isResizable()
    if (isResizable) {
      win.setResizable(false)
    }
	};
  // var onmouseup =  function(e) {
	// 	win.setResizable(true)
	// };

	element.on('mousedown', onmousedown);
  // element.on('mouseup', onmouseup);

	mouse.on('left-drag', function(x, y) {
		if(!offset) return;

		var screenScale = remote.screen.getDisplayNearestPoint({ x, y }).scaleFactor;
		x = Math.round(x / screenScale - offset[0]);
		y = Math.round(y / screenScale - offset[1]);
		win.setBounds({
			width: size[0],
			height: size[1],
			x, y
		});
	});

	mouse.on('left-up', function() {
    if (win && isResizable) {
      win.setResizable(true)
    }
		offset = null;
		win = null;
		size = null;
	});

	return function() {
		element.off('mousedown', onmousedown);
		mouse.destroy();
	};
};

drag.supported = supported
module.exports = supported ? drag : noop
