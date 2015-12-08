PlaneGeometry = function (width, depth, segmentsWidth, segmentsDepth) {
	Geometry.call(this);

	var ix, iz,
	width_half = width / 2,
	depth_half = depth / 2,
	gridX = segmentsWidth || 1,
	gridZ = segmentsDepth || 1,
	gridX1 = gridX + 1,
	gridZ1 = gridZ + 1,
	segment_width = width / gridX,
	segment_depth = depth / gridZ,
	normal = new Vector3(0, 1, 0);

	for (iz = 0; iz < gridZ1; iz ++) {
		for (ix = 0; ix < gridX1; ix ++) {
			var x = ix * segment_width - width_half;
			var z = iz * segment_depth - depth_half;

			this.vertices.push(new Vector3(x, 0, z));
		}
	}

	for (iz = 0; iz < gridZ; iz ++) {
		for (ix = 0; ix < gridX; ix ++) {
			var a = ix + gridX1 * iz;
			var b = ix + gridX1 * (iz + 1);
			var c = (ix + 1) + gridX1 * (iz + 1);
			var d = (ix + 1) + gridX1 * iz;

			var face = new Face4(a, b, c, d);
			face.normal.copy(normal);
			face.vertexNormals.push(normal.clone(), normal.clone(), normal.clone(), normal.clone());

			this.faces.push(face);
			this.faceVertexUvs[0].push([
				new UV(ix / gridX, iz / gridZ),
				new UV(ix / gridX, (iz + 1) / gridZ),
				new UV((ix + 1) / gridX, (iz + 1) / gridZ),
				new UV((ix + 1) / gridX, iz / gridZ)
			]);
		}
	}

	this.computeCentroids();
};

PlaneGeometry.prototype = new Geometry();
PlaneGeometry.prototype.constructor = PlaneGeometry;