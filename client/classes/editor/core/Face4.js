Face4 = function (a, b, c, d, normal, color, materialIndex) {
	this.a = a;
	this.b = b;
	this.c = c;
	this.d = d;

	this.normal = normal instanceof Vector3 ? normal : new Vector3();
	this.vertexNormals = normal instanceof Array ? normal : [];

	this.color = color instanceof Color ? color : new Color();
	this.vertexColors = color instanceof Array ? color : [];

	this.vertexTangents = [];

	this.materialIndex = materialIndex;

	this.centroid = new Vector3();
};

Face4.prototype = {
	constructor: Face4,

	clone: function () {
		var face = new Face4(this.a, this.b, this.c, this.d);

		face.normal.copy(this.normal);
		face.color.copy(this.color);
		face.centroid.copy(this.centroid);

		face.materialIndex = this.materialIndex;

		var i, il;
		for (i = 0, il = this.vertexNormals.length; i < il; i ++) face.vertexNormals[i] = this.vertexNormals[i].clone();
		for (i = 0, il = this.vertexColors.length; i < il; i ++) face.vertexColors[i] = this.vertexColors[i].clone();
		for (i = 0, il = this.vertexTangents.length; i < il; i ++) face.vertexTangents[i] = this.vertexTangents[i].clone();

		return face;
	}
};