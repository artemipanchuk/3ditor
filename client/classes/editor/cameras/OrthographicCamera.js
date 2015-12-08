OrthographicCamera = function (left, right, top, bottom, near, far) {
	Camera.call(this);

	this.left = left;
	this.right = right;
	this.top = top;
	this.bottom = bottom;

	this.near = (near !== undefined) ? near : 0.1;
	this.far = (far !== undefined) ? far : 2000;

	this.updateProjectionMatrix();
};

OrthographicCamera.prototype = new Camera();
OrthographicCamera.prototype.constructor = OrthographicCamera;

OrthographicCamera.prototype.updateProjectionMatrix = function () {
	this.projectionMatrix.makeOrthographic(this.left, this.right, this.top, this.bottom, this.near, this.far);
};