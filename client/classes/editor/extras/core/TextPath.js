TextPath = function (text, parameters) {
	Path.call(this);

	this.parameters = parameters || {};

	this.set(text);
};

TextPath.prototype.set = function (text, parameters) {
	parameters = parameters || this.parameters;

	this.text = text;

	var size = parameters.size !== undefined ? parameters.size : 100;
	var curveSegments = parameters.curveSegments !== undefined ? parameters.curveSegments: 4;

	var font = parameters.font !== undefined ? parameters.font : "helvetiker";
	var weight = parameters.weight !== undefined ? parameters.weight : "normal";
	var style = parameters.style !== undefined ? parameters.style : "normal";

	FontUtils.size = size;
	FontUtils.divisions = curveSegments;

	FontUtils.face = font;
	FontUtils.weight = weight;
	FontUtils.style = style;
};

TextPath.prototype.toShapes = function () {
	var data = FontUtils.drawText(this.text);

	var paths = data.paths;
	var shapes = [];

	for (var p = 0, pl = paths.length; p < pl; p ++) {
		Array.prototype.push.apply(shapes, paths[p].toShapes());
	}

	return shapes;
};