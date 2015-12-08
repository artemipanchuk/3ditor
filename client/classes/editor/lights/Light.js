
 
Light = function (hex) {
	Object3D.call(this);

	this.color = new Color(hex);
};

Light.prototype = new Object3D();
Light.prototype.constructor = Light;
Light.prototype.supr = Object3D.prototype;