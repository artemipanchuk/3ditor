MeshBasicMaterial = function (parameters) {
	Material.call(this, parameters);

	parameters = parameters || {};

	this.color = parameters.color !== undefined ? new Color(parameters.color) : new Color(0xffffff);

	this.map = parameters.map !== undefined ? parameters.map : null;

	this.lightMap = parameters.lightMap !== undefined ? parameters.lightMap : null;

	this.envMap = parameters.envMap !== undefined ? parameters.envMap : null;
	this.combine = parameters.combine !== undefined ? parameters.combine : MultiplyOperation;
	this.reflectivity = parameters.reflectivity !== undefined ? parameters.reflectivity : 1;
	this.refractionRatio = parameters.refractionRatio !== undefined ? parameters.refractionRatio : 0.98;

	this.fog = parameters.fog !== undefined ? parameters.fog : true;

	this.shading = parameters.shading !== undefined ? parameters.shading : SmoothShading;

	this.wireframe = parameters.wireframe !== undefined ? parameters.wireframe : false;
	this.wireframeLinewidth = parameters.wireframeLinewidth !== undefined ? parameters.wireframeLinewidth : 1;
	this.wireframeLinecap = parameters.wireframeLinecap !== undefined ? parameters.wireframeLinecap : 'round';
	this.wireframeLinejoin = parameters.wireframeLinejoin !== undefined ? parameters.wireframeLinejoin : 'round';

	this.vertexColors = parameters.vertexColors !== undefined ? parameters.vertexColors : NoColors;

	this.skinning = parameters.skinning !== undefined ? parameters.skinning : false;
	this.morphTargets = parameters.morphTargets !== undefined ? parameters.morphTargets : false;
};

MeshBasicMaterial.prototype = new Material();
MeshBasicMaterial.prototype.constructor = MeshBasicMaterial;