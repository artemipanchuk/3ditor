Particle = function (material) {
	Object3D.call(this);

	this.material = material;
};

Particle.prototype = new Object3D();
Particle.prototype.constructor = Particle;