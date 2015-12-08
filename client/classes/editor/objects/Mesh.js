Mesh = function (geometry, material) {
	Object3D.call(this);

	this.geometry = geometry;
	this.material = (material !== undefined) ? material : new MeshBasicMaterial({ color: Math.random() * 0xffffff, wireframe: true });

	if (this.geometry) {
		if(! this.geometry.boundingSphere) {
			this.geometry.computeBoundingSphere();
		}

		this.boundRadius = geometry.boundingSphere.radius;

		if(this.geometry.morphTargets.length) {
			this.morphTargetBase = -1;
			this.morphTargetForcedOrder = [];
			this.morphTargetInfluences = [];
			this.morphTargetDictionary = {};

			for(var m = 0; m < this.geometry.morphTargets.length; m ++) {
				this.morphTargetInfluences.push(0);
				this.morphTargetDictionary[this.geometry.morphTargets[m].name] = m;
			}
		}
	}
}

Mesh.prototype = new Object3D();
Mesh.prototype.constructor = Mesh;
Mesh.prototype.supr = Object3D.prototype;

Mesh.prototype.getMorphTargetIndexByName = function(name) {
	if (this.morphTargetDictionary[name] !== undefined) {
		return this.morphTargetDictionary[name];
	}

	console.log("Mesh.getMorphTargetIndexByName: morph target " + name + " does not exist. Returning 0.");
	return 0;
}