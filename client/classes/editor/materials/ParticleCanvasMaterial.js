ParticleCanvasMaterial = function (parameters) {
	Material.call(this, parameters);

	parameters = parameters || {};

	this.color = parameters.color !== undefined ? new Color(parameters.color) : new Color(0xffffff);
	this.program = parameters.program !== undefined ? parameters.program : function (context, color) {};
};

ParticleCanvasMaterial.prototype = new Material();
ParticleCanvasMaterial.prototype.constructor = ParticleCanvasMaterial;