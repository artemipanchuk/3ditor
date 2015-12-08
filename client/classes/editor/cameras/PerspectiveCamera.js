PerspectiveCamera = function (fov, aspect, near, far) {
	Camera.call(this);

	this.fov = fov !== undefined ? fov : 50;
	this.aspect = aspect !== undefined ? aspect : 1;
	this.near = near !== undefined ? near : 0.1;
	this.far = far !== undefined ? far : 2000;

	this.updateProjectionMatrix();
};

PerspectiveCamera.prototype = new Camera();
PerspectiveCamera.prototype.constructor = PerspectiveCamera;

PerspectiveCamera.prototype.setLens = function (focalLength, frameHeight) {
	frameHeight = frameHeight !== undefined ? frameHeight : 24;

	this.fov = 2 * Math.atan(frameHeight / (focalLength * 2)) * (180 / Math.PI);
	this.updateProjectionMatrix();
}

PerspectiveCamera.prototype.setViewOffset = function (fullWidth, fullHeight, x, y, width, height) {
	this.fullWidth = fullWidth;
	this.fullHeight = fullHeight;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;

	this.updateProjectionMatrix();
};

PerspectiveCamera.prototype.updateProjectionMatrix = function () {
	if (this.fullWidth) {
		var aspect = this.fullWidth / this.fullHeight;
		var top = Math.tan(this.fov * Math.PI / 360) * this.near;
		var bottom = -top;
		var left = aspect * bottom;
		var right = aspect * top;
		var width = Math.abs(right - left);
		var height = Math.abs(top - bottom);

		this.projectionMatrix.makeFrustum(
			left + this.x * width / this.fullWidth,
			left + (this.x + this.width) * width / this.fullWidth,
			top - (this.y + this.height) * height / this.fullHeight,
			top - this.y * height / this.fullHeight,
			this.near,
			this.far
		);
	} else {
		this.projectionMatrix.makePerspective(this.fov, this.aspect, this.near, this.far);
	}
};