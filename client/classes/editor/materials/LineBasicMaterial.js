LineBasicMaterial = function (parameters) {
	Material.call(this, parameters);

	parameters = parameters || {};

	this.color = parameters.color !== undefined ? new Color(parameters.color) : new Color(0xffffff);

	this.linewidth = parameters.linewidth !== undefined ? parameters.linewidth : 1;
	this.linecap = parameters.linecap !== undefined ? parameters.linecap : 'round';
	this.linejoin = parameters.linejoin !== undefined ? parameters.linejoin : 'round';

	this.vertexColors = parameters.vertexColors ? parameters.vertexColors : false;

	this.fog = parameters.fog !== undefined ? parameters.fog : true;
};

LineBasicMaterial.prototype = new Material();
LineBasicMaterial.prototype.constructor = LineBasicMaterial;