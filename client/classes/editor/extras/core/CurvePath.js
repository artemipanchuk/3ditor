CurvePath = function () {
	this.curves = [];
	this.bends = [];
	this.autoClose = false;
};

CurvePath.prototype = new Curve();
CurvePath.prototype.constructor = CurvePath;

CurvePath.prototype.add = function (curve) {
	this.curves.push(curve);
};

CurvePath.prototype.checkConnection = function() {
};

CurvePath.prototype.closePath = function() {
	var startPoint = this.curves[0].getPoint(0);
	var endPoint = this.curves[this.curves.length-1].getPoint(1);
	if (!startPoint.equals(endPoint)) {
		this.curves.push(new LineCurve(endPoint, startPoint));
	}
};

CurvePath.prototype.getPoint = function(t) {
	var d = t * this.getLength();
	var curveLengths = this.getCurveLengths();
	var i = 0, diff, curve;

	while (i < curveLengths.length) {
		if (curveLengths[i] >= d) {
			diff = curveLengths[i] - d;
			curve = this.curves[i];

			var u = 1 - diff / curve.getLength();

			return curve.getPointAt(u);

			break;
		}

		i ++;
	}

	return null;
};

CurvePath.prototype.getLength = function() {
	var lens = this.getCurveLengths();
	return lens[lens.length - 1];
};

CurvePath.prototype.getCurveLengths = function() {
	if (this.cacheLengths && this.cacheLengths.length == this.curves.length) {
		return this.cacheLengths;
	};

	var lengths = [], sums = 0;
	var i, il = this.curves.length;

	for (i = 0; i < il; i ++) {
		sums += this.curves[i].getLength();
		lengths.push(sums);
	}

	this.cacheLengths = lengths;

	return lengths;
};

CurvePath.prototype.getBoundingBox = function () {
	var points = this.getPoints();

	var maxX, maxY;
	var minX, minY;

	maxX = maxY = Number.NEGATIVE_INFINITY;
	minX = minY = Number.POSITIVE_INFINITY;

	var p, i, il, sum;

	sum = new Vector2();

	for (i = 0, il = points.length; i < il; i ++) {
		p = points[i];

		if (p.x > maxX) maxX = p.x;
		else if (p.x < minX) minX = p.x;

		if (p.y > maxY) maxY = p.y;
		else if (p.y < maxY) minY = p.y;

		sum.addSelf(p.x, p.y);
	}

	return {
		minX: minX,
		minY: minY,
		maxX: maxX,
		maxY: maxY,
		centroid: sum.divideScalar(il)
	};
};

CurvePath.prototype.createPointsGeometry = function(divisions) {
	var pts = this.getPoints(divisions, true);
	return this.createGeometry(pts);
};

CurvePath.prototype.createSpacedPointsGeometry = function(divisions) {
	var pts = this.getSpacedPoints(divisions, true);
	return this.createGeometry(pts);
};

CurvePath.prototype.createGeometry = function(points) {
	var geometry = new Geometry();

	for (var i = 0; i < points.length; i ++) {
		geometry.vertices.push(new Vector3(points[i].x, points[i].y, 0));
	}

	return geometry;
};

CurvePath.prototype.addWrapPath = function (bendpath) {
	this.bends.push(bendpath);
};

CurvePath.prototype.getTransformedPoints = function(segments, bends) {
	var oldPts = this.getPoints(segments);
	var i, il;

	if (!bends) {
		bends = this.bends;
	}

	for (i = 0, il = bends.length; i < il; i ++) {
		oldPts = this.getWrapPoints(oldPts, bends[i]);
	}

	return oldPts;
};

CurvePath.prototype.getTransformedSpacedPoints = function(segments, bends) {
	var oldPts = this.getSpacedPoints(segments);

	var i, il;

	if (!bends) {
		bends = this.bends;
	}

	for (i = 0, il = bends.length; i < il; i ++) {
		oldPts = this.getWrapPoints(oldPts, bends[i]);
	}

	return oldPts;
};

CurvePath.prototype.getWrapPoints = function (oldPts, path) {
	var bounds = this.getBoundingBox();

	var i, il, p, oldX, oldY, xNorm;

	for (i = 0, il = oldPts.length; i < il; i ++) {
		p = oldPts[i];

		oldX = p.x;
		oldY = p.y;

		xNorm = oldX / bounds.maxX;

		xNorm = path.getUtoTmapping(xNorm, oldX);

		var pathPt = path.getPoint(xNorm);
		var normal = path.getNormalVector(xNorm).multiplyScalar(oldY);

		p.x = pathPt.x + normal.x;
		p.y = pathPt.y + normal.y;
	}

	return oldPts;
};