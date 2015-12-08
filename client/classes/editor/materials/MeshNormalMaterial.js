MeshNormalMaterial = function (parameters) {
	Material.call(this, parameters);

	parameters = parameters || {};

	this.shading = parameters.shading ? parameters.shading : FlatShading;

	this.wireframe = parameters.wireframe ? parameters.wireframe : false;
	this.wireframeLinewidth = parameters.wireframeLinewidth ? parameters.wireframeLinewidth : 1;
};

MeshNormalMaterial.prototype = new Material();
MeshNormalMaterial.prototype.constructor = MeshNormalMaterial;