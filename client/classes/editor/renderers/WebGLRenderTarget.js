WebGLRenderTarget = function (width, height, options) {
	this.width = width;
	this.height = height;

	options = options || {};

	this.wrapS = options.wrapS !== undefined ? options.wrapS : ClampToEdgeWrapping;
	this.wrapT = options.wrapT !== undefined ? options.wrapT : ClampToEdgeWrapping;

	this.magFilter = options.magFilter !== undefined ? options.magFilter : LinearFilter;
	this.minFilter = options.minFilter !== undefined ? options.minFilter : LinearMipMapLinearFilter;

	this.offset = new Vector2(0, 0);
	this.repeat = new Vector2(1, 1);

	this.format = options.format !== undefined ? options.format : RGBAFormat;
	this.type = options.type !== undefined ? options.type : UnsignedByteType;

	this.depthBuffer = options.depthBuffer !== undefined ? options.depthBuffer : true;
	this.stencilBuffer = options.stencilBuffer !== undefined ? options.stencilBuffer : true;

	this.generateMipmaps = true;
};

WebGLRenderTarget.prototype.clone = function() {
	var tmp = new WebGLRenderTarget(this.width, this.height);

	tmp.wrapS = this.wrapS;
	tmp.wrapT = this.wrapT;

	tmp.magFilter = this.magFilter;
	tmp.minFilter = this.minFilter;

	tmp.offset.copy(this.offset);
	tmp.repeat.copy(this.repeat);

	tmp.format = this.format;
	tmp.type = this.type;

	tmp.depthBuffer = this.depthBuffer;
	tmp.stencilBuffer = this.stencilBuffer;

	return tmp;
};