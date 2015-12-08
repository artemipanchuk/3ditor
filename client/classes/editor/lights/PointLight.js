PointLight = function (hex, intensity, distance) {
	Light.call(this, hex);

	this.position = new Vector3(0, 0, 0);
	this.intensity = (intensity !== undefined) ? intensity : 1;
	this.distance = (distance !== undefined) ? distance : 0;
};

PointLight.prototype = new Light();
PointLight.prototype.constructor = PointLight;