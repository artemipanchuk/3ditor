Ribbon = function (geometry, material) {
	Object3D.call(this);

	this.geometry = geometry;
	this.material = material;
};

Ribbon.prototype = new Object3D();
Ribbon.prototype.constructor = Ribbon;