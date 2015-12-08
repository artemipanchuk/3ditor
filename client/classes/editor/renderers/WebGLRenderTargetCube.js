WebGLRenderTargetCube = function (width, height, options) {
	WebGLRenderTarget.call(this, width, height, options);

	this.activeCubeFace = 0;
};

WebGLRenderTargetCube.prototype = new WebGLRenderTarget();
WebGLRenderTargetCube.prototype.constructor = WebGLRenderTargetCube;