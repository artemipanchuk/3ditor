ParticleSystem = function (geometry, material) {
	Object3D.call(this);

	this.geometry = geometry;
	this.material = (material !== undefined) ? material : new ParticleBasicMaterial({ color: Math.random() * 0xffffff });

	this.sortParticles = false;

	if (this.geometry) {
		if(!this.geometry.boundingSphere) {
			this.geometry.computeBoundingSphere();
		}

		this.boundRadius = geometry.boundingSphere.radius;
	}

	this.frustumCulled = false;
};

ParticleSystem.prototype = new Object3D();
ParticleSystem.prototype.constructor = ParticleSystem;