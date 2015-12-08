ImmediateRenderObject = function () {
	Object3D.call(this);

	this.render = function(renderCallback) {
	};
};

ImmediateRenderObject.prototype = new Object3D();
ImmediateRenderObject.prototype.constructor = ImmediateRenderObject;