MeshDepthMaterial = function (parameters) {
	Material.call(this, parameters);

	parameters = parameters || {};

	this.shading = parameters.shading !== undefined ? parameters.shading : SmoothShading;

	this.wireframe = parameters.wireframe !== undefined ? parameters.wireframe : false;
	this.wireframeLinewidth = parameters.wireframeLinewidth !== undefined ? parameters.wireframeLinewidth : 1;
};

MeshDepthMaterial.prototype = new Material();
MeshDepthMaterial.prototype.constructor = MeshDepthMaterial;