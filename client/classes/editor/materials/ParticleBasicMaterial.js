ParticleBasicMaterial = function (parameters) {
	Material.call(this, parameters);

	parameters = parameters || {};

	this.color = parameters.color !== undefined ? new Color(parameters.color) : new Color(0xffffff);

	this.map = parameters.map !== undefined ? parameters.map : null;

	this.size = parameters.size !== undefined ? parameters.size : 1;
	this.sizeAttenuation = parameters.sizeAttenuation !== undefined ? parameters.sizeAttenuation : true;

	this.vertexColors = parameters.vertexColors !== undefined ? parameters.vertexColors : false;

	this.fog = parameters.fog !== undefined ? parameters.fog : true;
};

ParticleBasicMaterial.prototype = new Material();
ParticleBasicMaterial.prototype.constructor = ParticleBasicMaterial;