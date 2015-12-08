Gyroscope = function () {
	Object3D.call(this);
};

Gyroscope.prototype = new Object3D();
Gyroscope.prototype.constructor = Gyroscope;

Gyroscope.prototype.updateMatrixWorld = function (force) {
	this.matrixAutoUpdate && this.updateMatrix();

	if (this.matrixWorldNeedsUpdate || force) {
		if (this.parent) {
			this.matrixWorld.multiply(this.parent.matrixWorld, this.matrix);

			this.matrixWorld.decompose(this.translationWorld, this.rotationWorld, this.scaleWorld);
			this.matrix.decompose(this.translationObject, this.rotationObject, this.scaleObject);

			this.matrixWorld.compose(this.translationWorld, this.rotationObject, this.scaleWorld);
		} else {
			this.matrixWorld.copy(this.matrix);
		}

		this.matrixWorldNeedsUpdate = false;

		force = true;
	}

	for (var i = 0, l = this.children.length; i < l; i ++) {
		this.children[i].updateMatrixWorld(force);
	}
};

Gyroscope.prototype.translationWorld = new Vector3();
Gyroscope.prototype.translationObject = new Vector3();
Gyroscope.prototype.rotationWorld = new Quaternion();
Gyroscope.prototype.rotationObject = new Quaternion();
Gyroscope.prototype.scaleWorld = new Vector3();
Gyroscope.prototype.scaleObject = new Vector3();