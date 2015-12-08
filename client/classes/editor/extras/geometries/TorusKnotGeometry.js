TorusKnotGeometry = function (radius, tube, segmentsR, segmentsT, p, q, heightScale) {
	Geometry.call(this);

	var scope = this;

	this.radius = radius || 200;
	this.tube = tube || 40;
	this.segmentsR = segmentsR || 64;
	this.segmentsT = segmentsT || 8;
	this.p = p || 2;
	this.q = q || 3;
	this.heightScale = heightScale || 1;
	this.grid = new Array(this.segmentsR);

	var tang = new Vector3();
	var n = new Vector3();
	var bitan = new Vector3();

	for (var i = 0; i < this.segmentsR; ++ i) {
		this.grid[i] = new Array(this.segmentsT);

		for (var j = 0; j < this.segmentsT; ++ j) {
			var u = i / this.segmentsR * 2 * this.p * Math.PI;
			var v = j / this.segmentsT * 2 * Math.PI;
			var p1 = getPos(u, v, this.q, this.p, this.radius, this.heightScale);
			var p2 = getPos(u + 0.01, v, this.q, this.p, this.radius, this.heightScale);
			var cx, cy;

			tang.sub(p2, p1);
			n.add(p2, p1);

			bitan.cross(tang, n);
			n.cross(bitan, tang);
			bitan.normalize();
			n.normalize();

			cx = - this.tube * Math.cos(v);
			cy = this.tube * Math.sin(v);

			p1.x += cx * n.x + cy * bitan.x;
			p1.y += cx * n.y + cy * bitan.y;
			p1.z += cx * n.z + cy * bitan.z;

			this.grid[i][j] = vert(p1.x, p1.y, p1.z);
		}
	}

	for (var i = 0; i < this.segmentsR; ++ i) {
		for (var j = 0; j < this.segmentsT; ++ j) {
			var ip = (i + 1) % this.segmentsR;
			var jp = (j + 1) % this.segmentsT;

			var a = this.grid[i][j];
			var b = this.grid[ip][j];
			var c = this.grid[ip][jp];
			var d = this.grid[i][jp];

			var uva = new UV(i / this.segmentsR, j / this.segmentsT);
			var uvb = new UV((i + 1) / this.segmentsR, j / this.segmentsT);
			var uvc = new UV((i + 1) / this.segmentsR, (j + 1) / this.segmentsT);
			var uvd = new UV(i / this.segmentsR, (j + 1) / this.segmentsT);

			this.faces.push(new Face4(a, b, c, d));
			this.faceVertexUvs[0].push([uva,uvb,uvc, uvd]);
		}
	}

	this.computeCentroids();
	this.computeFaceNormals();
	this.computeVertexNormals();

	function vert(x, y, z) {
		return scope.vertices.push(new Vector3(x, y, z)) - 1;
	}

	function getPos(u, v, in_q, in_p, radius, heightScale) {
		var cu = Math.cos(u);
		var cv = Math.cos(v);
		var su = Math.sin(u);
		var quOverP = in_q / in_p * u;
		var cs = Math.cos(quOverP);

		var tx = radius * (2 + cs) * 0.5 * cu;
		var ty = radius * (2 + cs) * su * 0.5;
		var tz = heightScale * radius * Math.sin(quOverP) * 0.5;

		return new Vector3(tx, ty, tz);
	}
};

TorusKnotGeometry.prototype = new Geometry();
TorusKnotGeometry.prototype.constructor = TorusKnotGeometry;