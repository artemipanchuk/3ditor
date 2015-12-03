define(["classes/editor/cameras/Camera"], function() {
	this.PerspectiveCamera = function() {
		function PerspectiveCamera(fov, aspect, near, far) {
			Camera.call(this);

			this.type = "PerspectiveCamera";

			this.zoom = 1;

			this.fov    = fov !== undefined ? fov : 50;
			this.aspect = aspect !== undefined ? aspect : 1;
			this.near   = near !== undefined ? near : 0.1;
			this.far    = far !== undefined ? far : 2000;

			this.updateProjectionMatrix();
		};

		PerspectiveCamera.prototype = Object.create(Camera.prototype);
		PerspectiveCamera.prototype.constructor = PerspectiveCamera;

		PerspectiveCamera.prototype.setLens = function(focalLength, frameHeight) {
			if (frameHeight === undefined)
				frameHeight = 24;

			this.fov = 2 * Math.radToDeg(Math.atan(frameHeight / (focalLength * 2)));
			this.updateProjectionMatrix();
		};

		PerspectiveCamera.prototype.setViewOffset = function(fullWidth, fullHeight, x, y, width, height) {
			this.fullWidth = fullWidth;
			this.fullHeight = fullHeight;
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;

			this.updateProjectionMatrix();
		};

		PerspectiveCamera.prototype.updateProjectionMatrix = function() {
			var fov = Math.radToDeg(2 * Math.atan(Math.tan(Math.degToRad(this.fov) * 0.5) / this.zoom));

			if (this.fullWidth) {
				var aspect = this.fullWidth / this.fullHeight;
				var top = Math.tan(Math.degToRad(fov * 0.5)) * this.near;
				var bottom = - top;
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
				this.projectionMatrix.makePerspective(fov, this.aspect, this.near, this.far);
			}
		};

		PerspectiveCamera.prototype.copy = function(source) {
			Camera.prototype.copy.call(this, source);

			this.fov = source.fov;
			this.aspect = source.aspect;
			this.near = source.near;
			this.far = source.far;

			this.zoom = source.zoom;

			return this;
		};

		PerspectiveCamera.prototype.toJSON = function(meta) {
			var data = Object3D.prototype.toJSON.call(this, meta);

			data.object.zoom = this.zoom;
			data.object.fov = this.fov;
			data.object.aspect = this.aspect;
			data.object.near = this.near;
			data.object.far = this.far;

			return data;
		};

		return PerspectiveCamera;
	}();
});