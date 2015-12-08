AmbientLight = function (hex) {
	Light.call(this, hex);
};

AmbientLight.prototype = new Light();
AmbientLight.prototype.constructor = AmbientLight; 