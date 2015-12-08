TetrahedronGeometry = function (radius, detail) {
	var vertices = [
		[1,  1,  1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]
	];

	var faces = [
		[2, 1, 0], [0, 3, 2], [1, 3, 0], [2, 3, 1]
	];

	PolyhedronGeometry.call(this, vertices, faces, radius, detail);
};
TetrahedronGeometry.prototype = new Geometry();
TetrahedronGeometry.prototype.constructor = TetrahedronGeometry;