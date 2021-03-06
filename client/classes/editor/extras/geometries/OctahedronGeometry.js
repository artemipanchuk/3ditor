OctahedronGeometry = function (radius, detail) {
	var vertices = [
		[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]
	];

	var faces = [
		[0, 2, 4], [0, 4, 3], [0, 3, 5], [0, 5, 2], [1, 2, 5], [1, 5, 3], [1, 3, 4], [1, 4, 2]
	];

	PolyhedronGeometry.call(this, vertices, faces, radius, detail);
};
OctahedronGeometry.prototype = new Geometry();
OctahedronGeometry.prototype.constructor = OctahedronGeometry;