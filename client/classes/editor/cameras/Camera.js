Camera = function () {
	Object3D.call(this);

	this.matrixWorldInverse = new Matrix4();

	this.projectionMatrix = new Matrix4();
	this.projectionMatrixInverse = new Matrix4();
};

Camera.prototype = new Object3D();
Camera.prototype.constructor = Camera;

Camera.prototype.lookAt = function (vector) {
	this.matrix.lookAt(this.position, vector, this.up);

	if (this.rotationAutoUpdate) {
		this.rotation.getRotationFromMatrix(this.matrix);
	}
};