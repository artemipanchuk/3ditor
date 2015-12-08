var sin = Math.sin, cos = Math.cos, pi = Math.PI;

ParametricGeometries = {
	klein: function (v, u) {
		u *= pi;
		v *= 2 * pi;

		u = u * 2;
		var x, y, z;
		if (u < pi) {
			x = 3 * cos(u) * (1 + sin(u)) + (2 * (1 - cos(u) / 2)) * cos(u) * cos(v);
			z = -8 * sin(u) - 2 * (1 - cos(u) / 2) * sin(u) * cos(v);
		} else {
			x = 3 * cos(u) * (1 + sin(u)) + (2 * (1 - cos(u) / 2)) * cos(v + pi);
			z = -8 * sin(u);
		}

		y = -2 * (1 - cos(u) / 2) * sin(v);
		return new Vector3(x, y, z);
	},

	plane: function (width, height) {
		return function(u, v) {
			var x = u * width;
			var y = 0;
			var z = v * height;

			console.log(x, y, z);

			return new Vector3(x, y, z);
		};
	},

	mobius: function(u, t) {
		u = u - 0.5;
		var v = 2 * pi * t;

		var x, y, z;

		var a = 2;
		x = cos(v) * (a + u * cos(v/2));
		y = sin(v) * (a + u * cos(v/2));
		z = u * sin(v/2);
		return new Vector3(x, y, z);
	},

	mobius3d: function(u, t) {
		u *= pi;
		t *= 2 * pi;

		u = u * 2;
		var phi = u / 2;
		var major = 2.25, a = 0.125, b = 0.65;
		var x, y, z;
		x = a * cos(t) * cos(phi) - b * sin(t) * sin(phi);
		z = a * cos(t) * sin(phi) + b * sin(t) * cos(phi);
		y = (major + x) * sin(u);
		x = (major + x) * cos(u);
		return new Vector3(x, y, z);
	}
};

TubeGeometry2 = function(path, segments, radius, segmentsRadius, closed, debug) {
	this.path = path;
	this.segments = segments || 64;
	this.radius = radius || 1;
	this.segmentsRadius = segmentsRadius || 8;
	this.closed = closed || false;
	if (debug) this.debug = new Object3D();

	var scope = this,

		tangent, normal, binormal,

		numpoints = this.segments + 1,

		x, y, z, tx, ty, tz, u, v,

		cx, cy, pos, pos2 = new Vector3(),
		i, j, ip, jp, a, b, c, d, uva, uvb, uvc, uvd;

	var frames = new TubeGeometry.FrenetFrames(path, segments, closed),
		tangents = frames.tangents,
		normals = frames.normals,
		binormals = frames.binormals;
		this.tangents = tangents;
		this.normals = normals;
		this.binormals = binormals;

   

	var ParametricTube = function(u, v) {
		v *= 2 * pi;
		i = u * (numpoints - 1);
		i = Math.floor(i);

		pos = path.getPointAt(u);

		tangent = tangents[i];
		normal = normals[i];
		binormal = binormals[i];

		if (scope.debug) {
			scope.debug.add(new ArrowHelper(tangent, pos, radius, 0x0000ff));
			scope.debug.add(new ArrowHelper(normal, pos, radius, 0xff0000));
			scope.debug.add(new ArrowHelper(binormal, pos, radius, 0x00ff00));
		}
		cx = -scope.radius * Math.cos(v);
		cy = scope.radius * Math.sin(v);

		pos2.copy(pos);
		pos2.x += cx * normal.x + cy * binormal.x;
		pos2.y += cx * normal.y + cy * binormal.y;
		pos2.z += cx * normal.z + cy * binormal.z;

		return pos2.clone();
	};

	ParametricGeometry.call(this, ParametricTube, segments, segmentsRadius);
};

TubeGeometry2.prototype = new Geometry();
TubeGeometry2.prototype.constructor = TubeGeometry2;
 TorusKnotGeometry2 = function (radius, tube, segmentsR, segmentsT, p, q, heightScale) {
	var scope = this;

	this.radius = radius || 200;
	this.tube = tube || 40;
	this.segmentsR = segmentsR || 64;
	this.segmentsT = segmentsT || 8;
	this.p = p || 2;
	this.q = q || 3;
	this.heightScale = heightScale || 1;
   
   
	var TorusKnotCurve = Curve.create(

		function() {
		},

		function(t) {
			t *= Math.PI * 2;

			var r = 0.5;

			var tx = (1 + r * Math.cos(q * t)) * Math.cos(p * t),
				ty = (1 + r * Math.cos(q * t)) * Math.sin(p * t),
				tz = r * Math.sin(q * t);

			return new Vector3(tx, ty * heightScale, tz).multiplyScalar(radius);
		}

	);
	var segments = segmentsR;
	var radiusSegments = segmentsT;
	var extrudePath = new TorusKnotCurve();

	TubeGeometry2.call(this, extrudePath, segments, tube, radiusSegments, true, false);
};

TorusKnotGeometry2.prototype = new Geometry();
TorusKnotGeometry2.prototype.constructor = TorusKnotGeometry2;

SphereGeometry2 = function(size, x, y) {
	function sphere(u, v) {
		u *= pi;
		v *= 2 * pi;
		var x = sin(u) * cos(v);
		var y = cos(u);
		var z = -sin(u) * sin(v);

		return new Vector3(x, y, z).multiplyScalar(size);
	}
  
	ParametricGeometry.call(this, sphere, y, x);
};

SphereGeometry2.prototype = new Geometry();
SphereGeometry2.prototype.constructor = SphereGeometry2;

PlaneGeometry2 = function(width, depth, segmentsWidth, segmentsDepth) {
	function plane(u, v) {
		var x = u * width;
		var y = 0;
		var z = v * depth;

		return new Vector3(x, y, z);
	}
  
	ParametricGeometry.call(this, plane, segmentsWidth, segmentsDepth);
};

PlaneGeometry2.prototype = new Geometry();
PlaneGeometry2.prototype.constructor = PlaneGeometry2;