Curve = function () {
};

Curve.prototype.getPoint = function (t) {
	console.log("Warning, getPoint() not implemented!");
	return null;
};

Curve.prototype.getPointAt = function (u) {
	var t = this.getUtoTmapping(u);
	return this.getPoint(t);
};

Curve.prototype.getPoints = function (divisions) {
	if (!divisions) divisions = 5;

	var d, pts = [];

	for (d = 0; d <= divisions; d ++) {
		pts.push(this.getPoint(d / divisions));
	}

	return pts;
};

Curve.prototype.getSpacedPoints = function (divisions) {
	if (!divisions) divisions = 5;

	var d, pts = [];

	for (d = 0; d <= divisions; d ++) {
		pts.push(this.getPointAt(d / divisions));
	}

	return pts;
};

Curve.prototype.getLength = function () {
	var lengths = this.getLengths();
	return lengths[lengths.length - 1];
};

Curve.prototype.getLengths = function (divisions) {
	if (!divisions) divisions = (this.__arcLengthDivisions) ? (this.__arcLengthDivisions): 200;

	if (this.cacheArcLengths 
		&& (this.cacheArcLengths.length == divisions + 1) 
		&& !this.needsUpdate) {
		return this.cacheArcLengths;
	}

	this.needsUpdate = false;

	var cache = [];
	var current, last = this.getPoint(0);
	var p, sum = 0;

	cache.push(0);

	for (p = 1; p <= divisions; p ++) {
		current = this.getPoint (p / divisions);
		sum += current.distanceTo(last);
		cache.push(sum);
		last = current;
	}

	this.cacheArcLengths = cache;

	return cache;
};

Curve.prototype.updateArcLengths = function() {
	this.needsUpdate = true;
	this.getLengths();
};

Curve.prototype.getUtoTmapping = function (u, distance) {
	var arcLengths = this.getLengths();

	var i = 0, il = arcLengths.length;

	var targetArcLength;

	if (distance) {
		targetArcLength = distance;
	} else {
		targetArcLength = u * arcLengths[il - 1];
	}

	var low = 0, high = il - 1, comparison;

	while (low <= high) {
		i = Math.floor(low + (high - low) / 2);

		comparison = arcLengths[i] - targetArcLength;

		if (comparison < 0) {
			low = i + 1;
			continue;
		} else if (comparison > 0) {
			high = i - 1;
			continue;
		} else {
			high = i;
			break;
		}
	}

	i = high;

	if (arcLengths[i] == targetArcLength) {
		var t = i / (il - 1);
		return t;
	}

	var lengthBefore = arcLengths[i];
    var lengthAfter = arcLengths[i + 1];

    var segmentLength = lengthAfter - lengthBefore;

    var segmentFraction = (targetArcLength - lengthBefore) / segmentLength;

    var t = (i + segmentFraction) / (il -1);

	return t;
};
Curve.prototype.getNormalVector = function(t) {
	var vec = this.getTangent(t);

	return new Vector2(-vec.y , vec.x);
};

Curve.prototype.getTangent = function(t) {
	var delta = 0.0001;
	var t1 = t - delta;
	var t2 = t + delta;

	if (t1 < 0) t1 = 0;
	if (t2 > 1) t2 = 1;

	var pt1 = this.getPoint(t1);
	var pt2 = this.getPoint(t2);
	var vec = pt2.clone().subSelf(pt1);
	return vec.normalize();
};

Curve.prototype.getTangentAt = function (u) {
	var t = this.getUtoTmapping(u);
	return this.getTangent(t);
};

LineCurve = function (v1, v2) {
	this.v1 = v1;
	this.v2 = v2;
};

LineCurve.prototype = new Curve();
LineCurve.prototype.constructor = LineCurve;

LineCurve.prototype.getPoint = function (t) {
	var point = this.v2.clone().subSelf(this.v1);
	point.multiplyScalar(t).addSelf(this.v1);

	return point;
};

LineCurve.prototype.getPointAt = function (u) {
	return this.getPoint(u);
};

LineCurve.prototype.getTangent = function(t) {
	var tangent = this.v2.clone().subSelf(this.v1);

	return tangent.normalize();
};

QuadraticBezierCurve = function (v0, v1, v2) {
	this.v0 = v0;
	this.v1 = v1;
	this.v2 = v2;
};

QuadraticBezierCurve.prototype = new Curve();
QuadraticBezierCurve.prototype.constructor = QuadraticBezierCurve;

QuadraticBezierCurve.prototype.getPoint = function (t) {
	var tx, ty;

	tx = Shape.Utils.b2(t, this.v0.x, this.v1.x, this.v2.x);
	ty = Shape.Utils.b2(t, this.v0.y, this.v1.y, this.v2.y);

	return new Vector2(tx, ty);
};

QuadraticBezierCurve.prototype.getTangent = function(t) {
	var tx, ty;

	tx = Curve.Utils.tangentQuadraticBezier(t, this.v0.x, this.v1.x, this.v2.x);
	ty = Curve.Utils.tangentQuadraticBezier(t, this.v0.y, this.v1.y, this.v2.y);

	var tangent = new Vector2(tx, ty);
	tangent.normalize();

	return tangent;
};

CubicBezierCurve = function (v0, v1, v2, v3) {
	this.v0 = v0;
	this.v1 = v1;
	this.v2 = v2;
	this.v3 = v3;
};

CubicBezierCurve.prototype = new Curve();
CubicBezierCurve.prototype.constructor = CubicBezierCurve;

CubicBezierCurve.prototype.getPoint = function (t) {
	var tx, ty;

	tx = Shape.Utils.b3(t, this.v0.x, this.v1.x, this.v2.x, this.v3.x);
	ty = Shape.Utils.b3(t, this.v0.y, this.v1.y, this.v2.y, this.v3.y);

	return new Vector2(tx, ty);
};

CubicBezierCurve.prototype.getTangent = function(t) {
	var tx, ty;

	tx = Curve.Utils.tangentCubicBezier(t, this.v0.x, this.v1.x, this.v2.x, this.v3.x);
	ty = Curve.Utils.tangentCubicBezier(t, this.v0.y, this.v1.y, this.v2.y, this.v3.y);

	var tangent = new Vector2(tx, ty);
	tangent.normalize();

	return tangent;
};

SplineCurve = function (points ) {
	this.points = (points == undefined) ? [] : points;
};

SplineCurve.prototype = new Curve();
SplineCurve.prototype.constructor = SplineCurve;

SplineCurve.prototype.getPoint = function (t) {
	var v = new Vector2();
	var c = [];
	var points = this.points, point, intPoint, weight;
	point = (points.length - 1) * t;

	intPoint = Math.floor(point);
	weight = point - intPoint;

	c[0] = intPoint == 0 ? intPoint : intPoint - 1;
	c[1] = intPoint;
	c[2] = intPoint  > points.length - 2 ? points.length -1 : intPoint + 1;
	c[3] = intPoint  > points.length - 3 ? points.length -1 : intPoint + 2;

	v.x = Curve.Utils.interpolate(points[c[0]].x, points[c[1]].x, points[c[2]].x, points[c[3]].x, weight);
	v.y = Curve.Utils.interpolate(points[c[0]].y, points[c[1]].y, points[c[2]].y, points[c[3]].y, weight);

	return v;
};

ArcCurve = function (aX, aY, aRadius,
							aStartAngle, aEndAngle,
							aClockwise) {
	this.aX = aX;
	this.aY = aY;

	this.aRadius = aRadius;

	this.aStartAngle = aStartAngle;
	this.aEndAngle = aEndAngle;

	this.aClockwise = aClockwise;
};

ArcCurve.prototype = new Curve();
ArcCurve.prototype.constructor = ArcCurve;

ArcCurve.prototype.getPoint = function (t) {
	var deltaAngle = this.aEndAngle - this.aStartAngle;

	if (!this.aClockwise) {
		t = 1 - t;
	}

	var angle = this.aStartAngle + t * deltaAngle;

	var tx = this.aX + this.aRadius * Math.cos(angle);
	var ty = this.aY + this.aRadius * Math.sin(angle);

	return new Vector2(tx, ty);
};

Curve.Utils = {
	tangentQuadraticBezier: function (t, p0, p1, p2) {
		return 2 * (1 - t) * (p1 - p0) + 2 * t * (p2 - p1);
	},

	tangentCubicBezier: function (t, p0, p1, p2, p3) {
		return -3 * p0 * (1 - t) * (1 - t)  +
			3 * p1 * (1 - t) * (1-t) - 6 *t *p1 * (1-t) +
			6 * t *  p2 * (1-t) - 3 * t * t * p2 +
			3 * t * t * p3;
	},

	tangentSpline: function (t, p0, p1, p2, p3) {
		var h00 = 6 * t * t - 6 * t;
		var h10 = 3 * t * t - 4 * t + 1;
		var h01 = -6 * t * t + 6 * t;
		var h11 = 3 * t * t - 2 * t;

		return h00 + h10 + h01 + h11;
	},

	interpolate: function(p0, p1, p2, p3, t) {
		var v0 = (p2 - p0) * 0.5;
		var v1 = (p3 - p1) * 0.5;
		var t2 = t * t;
		var t3 = t * t2;
		return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (- 3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
	}
};

Curve.create = function(constructor, getPointFunc) {
    var subClass = constructor;

	subClass.prototype = new Curve();

	subClass.prototype.constructor = constructor;
    subClass.prototype.getPoint = getPointFunc;

	return subClass;
};

LineCurve3 = Curve.create(

	function (v1, v2) {
		this.v1 = v1;
		this.v2 = v2;
	},

	function (t) {
		var r = new Vector3();

		r.sub(this.v2, this.v1);
		r.multiplyScalar(t);
		r.addSelf(this.v1);

		return r;
	}

);

QuadraticBezierCurve3 = Curve.create(

	function (v0, v1, v2) {
		this.v0 = v0;
		this.v1 = v1;
		this.v2 = v2;
	},

	function (t) {
		var tx, ty, tz;

		tx = Shape.Utils.b2(t, this.v0.x, this.v1.x, this.v2.x);
		ty = Shape.Utils.b2(t, this.v0.y, this.v1.y, this.v2.y);
		tz = Shape.Utils.b2(t, this.v0.z, this.v1.z, this.v2.z);

		return new Vector3(tx, ty, tz);
	}

);

CubicBezierCurve3 = Curve.create(

	function (v0, v1, v2, v3) {
		this.v0 = v0;
		this.v1 = v1;
		this.v2 = v2;
		this.v3 = v3;
	},

	function (t) {
		var tx, ty, tz;

		tx = Shape.Utils.b3(t, this.v0.x, this.v1.x, this.v2.x, this.v3.x);
		ty = Shape.Utils.b3(t, this.v0.y, this.v1.y, this.v2.y, this.v3.y);
		tz = Shape.Utils.b3(t, this.v0.z, this.v1.z, this.v2.z, this.v3.z);

		return new Vector3(tx, ty, tz);
	}

);

SplineCurve3 = Curve.create(

	function (points) {
		this.points = (points == undefined) ? [] : points;
	},

	function (t) {
		var v = new Vector3();
		var c = [];
		var points = this.points, point, intPoint, weight;
		point = (points.length - 1) * t;

		intPoint = Math.floor(point);
		weight = point - intPoint;

		c[0] = intPoint == 0 ? intPoint : intPoint - 1;
		c[1] = intPoint;
		c[2] = intPoint  > points.length - 2 ? points.length - 1 : intPoint + 1;
		c[3] = intPoint  > points.length - 3 ? points.length - 1 : intPoint + 2;

		var pt0 = points[c[0]],
			pt1 = points[c[1]],
			pt2 = points[c[2]],
			pt3 = points[c[3]];

		v.x = Curve.Utils.interpolate(pt0.x, pt1.x, pt2.x, pt3.x, weight);
		v.y = Curve.Utils.interpolate(pt0.y, pt1.y, pt2.y, pt3.y, weight);
		v.z = Curve.Utils.interpolate(pt0.z, pt1.z, pt2.z, pt3.z, weight);

		return v;
	}

);

ClosedSplineCurve3 = Curve.create(

	function (points) {
		this.points = (points == undefined) ? [] : points;
	},

    function (t) {
        var v = new Vector3();
        var c = [];
        var points = this.points, point, intPoint, weight;
        point = (points.length - 0) * t;

        intPoint = Math.floor(point);
        weight = point - intPoint;
            
        intPoint += intPoint > 0 ? 0 : (Math.floor(Math.abs(intPoint) / points.length) + 1) * points.length;
        c[0] = (intPoint - 1) % points.length;
        c[1] = (intPoint) % points.length;
        c[2] = (intPoint + 1) % points.length;
        c[3] = (intPoint + 2) % points.length;

        v.x = Curve.Utils.interpolate(points[c[0]].x, points[c[1]].x, points[c[2]].x, points[c[3]].x, weight);
        v.y = Curve.Utils.interpolate(points[c[0]].y, points[c[1]].y, points[c[2]].y, points[c[3]].y, weight);
        v.z = Curve.Utils.interpolate(points[c[0]].z, points[c[1]].z, points[c[2]].z, points[c[3]].z, weight);
        
        return v;

    }

);