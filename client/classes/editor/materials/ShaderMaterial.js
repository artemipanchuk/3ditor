ShaderMaterial = function (parameters) {
	Material.call(this, parameters);

	parameters = parameters || {};

	this.fragmentShader = parameters.fragmentShader !== undefined ? parameters.fragmentShader : "void main() {}";
	this.vertexShader = parameters.vertexShader !== undefined ? parameters.vertexShader : "void main() {}";
	this.uniforms = parameters.uniforms !== undefined ? parameters.uniforms : {};
	this.attributes = parameters.attributes;

	this.shading = parameters.shading !== undefined ? parameters.shading : SmoothShading;

	this.wireframe = parameters.wireframe !== undefined ? parameters.wireframe : false;
	this.wireframeLinewidth = parameters.wireframeLinewidth !== undefined ? parameters.wireframeLinewidth : 1;

	this.fog = parameters.fog !== undefined ? parameters.fog : false;

	this.lights = parameters.lights !== undefined ? parameters.lights : false;

	this.vertexColors = parameters.vertexColors !== undefined ? parameters.vertexColors : NoColors;

	this.skinning = parameters.skinning !== undefined ? parameters.skinning : false;

	this.morphTargets = parameters.morphTargets !== undefined ? parameters.morphTargets : false;
	this.morphNormals = parameters.morphNormals !== undefined ? parameters.morphNormals : false;
};

ShaderMaterial.prototype = new Material();
ShaderMaterial.prototype.constructor = ShaderMaterial;