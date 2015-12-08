Path = function (points) {
	CurvePath.call(this);

	this.actions = [];

	if (points) {
		this.fromPoints(points);
	}
};

Path.prototype = new CurvePath();
Path.prototype.constructor = Path;

PathActions = {
	MOVE_TO: 'moveTo',
	LINE_TO: 'lineTo',
	QUADRATIC_CURVE_TO: 'quadraticCurveTo',
	BEZIER_CURVE_TO: 'bezierCurveTo',
	CSPLINE_THRU: 'splineThru',
	ARC: 'arc'
};

Path.prototype.fromPoints = function (vectors) {
	this.moveTo(vectors[0].x, vectors[0].y);

	for (var v = 1, vlen = vectors.length; v < vlen; v ++) {
		this.lineTo(vectors[v].x, vectors[v].y);
	};
};

Path.prototype.moveTo = function (x, y) {
	var args = Array.prototype.slice.call(arguments);
	this.actions.push({ action: PathActions.MOVE_TO, args: args });
};

Path.prototype.lineTo = function (x, y) {
	var args = Array.prototype.slice.call(arguments);

	var lastargs = this.actions[this.actions.length - 1].args;

	var x0 = lastargs[lastargs.length - 2];
	var y0 = lastargs[lastargs.length - 1];

	var curve = new LineCurve(new Vector2(x0, y0), new Vector2(x, y));
	this.curves.push(curve);

	this.actions.push({ action: PathActions.LINE_TO, args: args });
};

Path.prototype.quadraticCurveTo = function(aCPx, aCPy, aX, aY) {
	var args = Array.prototype.slice.call(arguments);

	var lastargs = this.actions[this.actions.length - 1].args;

	var x0 = lastargs[lastargs.length - 2];
	var y0 = lastargs[lastargs.length - 1];

	var curve = new QuadraticBezierCurve(new Vector2(x0, y0),
												new Vector2(aCPx, aCPy),
												new Vector2(aX, aY));
	this.curves.push(curve);

	this.actions.push({ action: PathActions.QUADRATIC_CURVE_TO, args: args });
};

Path.prototype.bezierCurveTo = function(aCP1x, aCP1y,
                                               aCP2x, aCP2y,
                                               aX, aY) {
	var args = Array.prototype.slice.call(arguments);

	var lastargs = this.actions[this.actions.length - 1].args;

	var x0 = lastargs[lastargs.length - 2];
	var y0 = lastargs[lastargs.length - 1];

	var curve = new CubicBezierCurve(new Vector2(x0, y0),
											new Vector2(aCP1x, aCP1y),
											new Vector2(aCP2x, aCP2y),
											new Vector2(aX, aY));
	this.curves.push(curve);

	this.actions.push({ action: PathActions.BEZIER_CURVE_TO, args: args });
};

Path.prototype.splineThru = function(pts ) {
	var args = Array.prototype.slice.call(arguments);
	var lastargs = this.actions[this.actions.length - 1].args;

	var x0 = lastargs[lastargs.length - 2];
	var y0 = lastargs[lastargs.length - 1];
	var npts = [new Vector2(x0, y0)];
	Array.prototype.push.apply(npts, pts);

	var curve = new SplineCurve(npts);
	this.curves.push(curve);

	this.actions.push({ action: PathActions.CSPLINE_THRU, args: args });
};

Path.prototype.arc = function (aX, aY, aRadius,
									  aStartAngle, aEndAngle, aClockwise) {
	var args = Array.prototype.slice.call(arguments);

	var laste = this.actions[this.actions.length - 1];

	var curve = new ArcCurve(laste.x + aX, laste.y + aY, aRadius,
									aStartAngle, aEndAngle, aClockwise);
	this.curves.push(curve);
	var lastPoint = curve.getPoint(aClockwise ? 1 : 0);
	args.push(lastPoint.x);
	args.push(lastPoint.y);

	this.actions.push({ action: PathActions.ARC, args: args });

 };

Path.prototype.absarc = function (aX, aY, aRadius,
									  aStartAngle, aEndAngle, aClockwise) {
	var args = Array.prototype.slice.call(arguments);

	var curve = new ArcCurve(aX, aY, aRadius,
									aStartAngle, aEndAngle, aClockwise);
	this.curves.push(curve);
        var lastPoint = curve.getPoint(aClockwise ? 1 : 0);
        args.push(lastPoint.x);
        args.push(lastPoint.y);

	this.actions.push({ action: PathActions.ARC, args: args });

 };

Path.prototype.getSpacedPoints = function (divisions, closedPath) {
	if (! divisions) divisions = 40;

	var points = [];

	for (var i = 0; i < divisions; i ++) {
		points.push(this.getPoint(i / divisions));
	}

	return points;
};

Path.prototype.getPoints = function(divisions, closedPath) {
	if (this.useSpacedPoints) {
		console.log('tata');
		return this.getSpacedPoints(divisions, closedPath);
	}

	divisions = divisions || 12;

	var points = [];

	var i, il, item, action, args;
	var cpx, cpy, cpx2, cpy2, cpx1, cpy1, cpx0, cpy0,
		laste, j,
		t, tx, ty;

	for (i = 0, il = this.actions.length; i < il; i ++) {
		item = this.actions[i];

		action = item.action;
		args = item.args;

		switch(action) {
		case PathActions.MOVE_TO:

			points.push(new Vector2(args[0], args[1]));

			break;

		case PathActions.LINE_TO:

			points.push(new Vector2(args[0], args[1]));

			break;

		case PathActions.QUADRATIC_CURVE_TO:

			cpx  = args[2];
			cpy  = args[3];

			cpx1 = args[0];
			cpy1 = args[1];

			if (points.length > 0) {
				laste = points[points.length - 1];

				cpx0 = laste.x;
				cpy0 = laste.y;
			} else {
				laste = this.actions[i - 1].args;

				cpx0 = laste[laste.length - 2];
				cpy0 = laste[laste.length - 1];
			}

			for (j = 1; j <= divisions; j ++) {
				t = j / divisions;

				tx = Shape.Utils.b2(t, cpx0, cpx1, cpx);
				ty = Shape.Utils.b2(t, cpy0, cpy1, cpy);

				points.push(new Vector2(tx, ty));

		  	}

			break;

		case PathActions.BEZIER_CURVE_TO:

			cpx  = args[4];
			cpy  = args[5];

			cpx1 = args[0];
			cpy1 = args[1];

			cpx2 = args[2];
			cpy2 = args[3];

			if (points.length > 0) {
				laste = points[points.length - 1];

				cpx0 = laste.x;
				cpy0 = laste.y;
			} else {
				laste = this.actions[i - 1].args;

				cpx0 = laste[laste.length - 2];
				cpy0 = laste[laste.length - 1];
			}

			for (j = 1; j <= divisions; j ++) {
				t = j / divisions;

				tx = Shape.Utils.b3(t, cpx0, cpx1, cpx2, cpx);
				ty = Shape.Utils.b3(t, cpy0, cpy1, cpy2, cpy);

				points.push(new Vector2(tx, ty));
			}

			break;

		case PathActions.CSPLINE_THRU:

			laste = this.actions[i - 1].args;

			var last = new Vector2(laste[laste.length - 2], laste[laste.length - 1]);
			var spts = [last];

			var n = divisions * args[0].length;

			spts = spts.concat(args[0]);

			var spline = new SplineCurve(spts);

			for (j = 1; j <= n; j ++) {
				points.push(spline.getPointAt(j / n)) ;
			}

			break;

		case PathActions.ARC:

			laste = this.actions[i - 1].args;

			var aX = args[0], aY = args[1],
				aRadius = args[2],
				aStartAngle = args[3], aEndAngle = args[4],
				aClockwise = !!args[5];

			var deltaAngle = aEndAngle - aStartAngle;
			var angle;
			var tdivisions = divisions * 2;

			for (j = 1; j <= tdivisions; j ++) {
				t = j / tdivisions;

				if (! aClockwise) {
					t = 1 - t;
				}

				angle = aStartAngle + t * deltaAngle;

				tx = aX + aRadius * Math.cos(angle);
				ty = aY + aRadius * Math.sin(angle);

				points.push(new Vector2(tx, ty));
			}

		  break;
		}
	}
	var lastPoint = points[points.length - 1];
	var EPSILON = 0.0000000001;
	if (Math.abs(lastPoint.x - points[0].x) < EPSILON &&
             Math.abs(lastPoint.y - points[0].y) < EPSILON)
		points.splice(points.length - 1, 1);
	if (closedPath) {
		points.push(points[0]);
	}

	return points;
};

Path.prototype.transform = function(path, segments) {
	var bounds = this.getBoundingBox();
	var oldPts = this.getPoints(segments);

	return this.getWrapPoints(oldPts, path);
};

Path.prototype.nltransform = function(a, b, c, d, e, f) {
	var oldPts = this.getPoints();

	var i, il, p, oldX, oldY;

	for (i = 0, il = oldPts.length; i < il; i ++) {
		p = oldPts[i];

		oldX = p.x;
		oldY = p.y;

		p.x = a * oldX + b * oldY + c;
		p.y = d * oldY + e * oldX + f;
	}

	return oldPts;
};

Path.prototype.debug = function(canvas) {
	var bounds = this.getBoundingBox();

	if (!canvas) {
		canvas = document.createElement("canvas");

		canvas.setAttribute('width',  bounds.maxX + 100);
		canvas.setAttribute('height', bounds.maxY + 100);

		document.body.appendChild(canvas);
	}

	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.strokeStyle = "black";
	ctx.beginPath();

	var i, il, item, action, args;

	for (i = 0, il = this.actions.length; i < il; i ++) {
		item = this.actions[i];

		args = item.args;
		action = item.action;

		if (action != PathActions.CSPLINE_THRU) {
			ctx[action].apply(ctx, args);
		}

	}

	ctx.stroke();
	ctx.closePath();

	ctx.strokeStyle = "red";
	var p, points = this.getPoints();

	for (i = 0, il = points.length; i < il; i ++) {
		p = points[i];

		ctx.beginPath();
		ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2, false);
		ctx.stroke();
		ctx.closePath();
	}
};

Path.prototype.toShapes = function() {
	var i, il, item, action, args;

	var subPaths = [], lastPath = new Path();

	for (i = 0, il = this.actions.length; i < il; i ++) {
		item = this.actions[i];

		args = item.args;
		action = item.action;

		if (action == PathActions.MOVE_TO) {
			if (lastPath.actions.length != 0) {
				subPaths.push(lastPath);
				lastPath = new Path();
			}
		}

		lastPath[action].apply(lastPath, args);
	}

	if (lastPath.actions.length != 0) {
		subPaths.push(lastPath);
	}

	if (subPaths.length == 0) return [];

	var tmpPath, tmpShape, shapes = [];

	var holesFirst = !Shape.Utils.isClockWise(subPaths[0].getPoints());

	if (subPaths.length == 1) {
		tmpPath = subPaths[0];
		tmpShape = new Shape();
		tmpShape.actions = tmpPath.actions;
		tmpShape.curves = tmpPath.curves;
		shapes.push(tmpShape);
		return shapes;
	};

	if (holesFirst) {
		tmpShape = new Shape();

		for (i = 0, il = subPaths.length; i < il; i ++) {
			tmpPath = subPaths[i];

			if (Shape.Utils.isClockWise(tmpPath.getPoints())) {
				tmpShape.actions = tmpPath.actions;
				tmpShape.curves = tmpPath.curves;

				shapes.push(tmpShape);
				tmpShape = new Shape();
			} else {
				tmpShape.holes.push(tmpPath);
			}
		}
	} else {
		for (i = 0, il = subPaths.length; i < il; i ++) {
			tmpPath = subPaths[i];

			if (Shape.Utils.isClockWise(tmpPath.getPoints())) {

				if (tmpShape) shapes.push(tmpShape);

				tmpShape = new Shape();
				tmpShape.actions = tmpPath.actions;
				tmpShape.curves = tmpPath.curves;
			} else {
				tmpShape.holes.push(tmpPath);
			}
		}

		shapes.push(tmpShape);
	}

	return shapes;
};