Shape = function () {
	Path.apply(this, arguments);
	this.holes = [];
};

Shape.prototype = new Path();
Shape.prototype.constructor = Path;

Shape.prototype.extrude = function (options) {
	var extruded = new ExtrudeGeometry(this, options);
	return extruded;
};

Shape.prototype.getPointsHoles = function (divisions) {
	var i, il = this.holes.length, holesPts = [];

	for (i = 0; i < il; i ++) {
		holesPts[i] = this.holes[i].getTransformedPoints(divisions, this.bends);
	}

	return holesPts;
};

Shape.prototype.getSpacedPointsHoles = function (divisions) {
	var i, il = this.holes.length, holesPts = [];

	for (i = 0; i < il; i ++) {
		holesPts[i] = this.holes[i].getTransformedSpacedPoints(divisions, this.bends);
	}

	return holesPts;
};

Shape.prototype.extractAllPoints = function (divisions) {
	return {
		shape: this.getTransformedPoints(divisions),
		holes: this.getPointsHoles(divisions)
	};
};

Shape.prototype.extractPoints = function (divisions) {
	if (this.useSpacedPoints) {
		return this.extractAllSpacedPoints(divisions);
	}

	return this.extractAllPoints(divisions);
};

Shape.prototype.extractAllSpacedPoints = function (divisions) {
	return {
		shape: this.getTransformedSpacedPoints(divisions),
		holes: this.getSpacedPointsHoles(divisions)
	};
};

Shape.Utils = {

	removeHoles: function (contour, holes) {
		var shape = contour.concat();
		var allpoints = shape.concat();
		var prevShapeVert, nextShapeVert,
			prevHoleVert, nextHoleVert,
			holeIndex, shapeIndex,
			shapeId, shapeGroup,
			h, h2,
			hole, shortest, d,
			p, pts1, pts2,
			tmpShape1, tmpShape2,
			tmpHole1, tmpHole2,
			verts = [];

		for (h = 0; h < holes.length; h ++) {
			hole = holes[h];
			Array.prototype.push.apply(allpoints, hole);

			shortest = Number.POSITIVE_INFINITY;

			for (h2 = 0; h2 < hole.length; h2 ++) {
				pts1 = hole[h2];
				var dist = [];

				for (p = 0; p < shape.length; p++) {
					pts2 = shape[p];
					d = pts1.distanceToSquared(pts2);
					dist.push(d);

					if (d < shortest) {
						shortest = d;
						holeIndex = h2;
						shapeIndex = p;
					}
				}
			}

			prevShapeVert = (shapeIndex - 1) >= 0 ? shapeIndex - 1 : shape.length - 1;
			prevHoleVert = (holeIndex - 1) >= 0 ? holeIndex - 1 : hole.length - 1;

			var areaapts = [

				hole[holeIndex],
				shape[shapeIndex],
				shape[prevShapeVert]

			];

			var areaa = FontUtils.Triangulate.area(areaapts);

			var areabpts = [

				hole[holeIndex],
				hole[prevHoleVert],
				shape[shapeIndex]

			];

			var areab = FontUtils.Triangulate.area(areabpts);

			var shapeOffset = 1;
			var holeOffset = -1;

			var oldShapeIndex = shapeIndex, oldHoleIndex = holeIndex;
			shapeIndex += shapeOffset;
			holeIndex += holeOffset;

			if (shapeIndex < 0) { shapeIndex += shape.length;  }
			shapeIndex %= shape.length;

			if (holeIndex < 0) { holeIndex += hole.length;  }
			holeIndex %= hole.length;

			prevShapeVert = (shapeIndex - 1) >= 0 ? shapeIndex - 1 : shape.length - 1;
			prevHoleVert = (holeIndex - 1) >= 0 ? holeIndex - 1 : hole.length - 1;

			areaapts = [

				hole[holeIndex],
				shape[shapeIndex],
				shape[prevShapeVert]

			];

			var areaa2 = FontUtils.Triangulate.area(areaapts);

			areabpts = [

				hole[holeIndex],
				hole[prevHoleVert],
				shape[shapeIndex]

			];

			var areab2 = FontUtils.Triangulate.area(areabpts);

			if ((areaa + areab) > (areaa2 + areab2)) {
				shapeIndex = oldShapeIndex;
				holeIndex = oldHoleIndex ;

				if (shapeIndex < 0) { shapeIndex += shape.length;  }
				shapeIndex %= shape.length;

				if (holeIndex < 0) { holeIndex += hole.length;  }
				holeIndex %= hole.length;

				prevShapeVert = (shapeIndex - 1) >= 0 ? shapeIndex - 1 : shape.length - 1;
				prevHoleVert = (holeIndex - 1) >= 0 ? holeIndex - 1 : hole.length - 1;
			} else {
			}

			tmpShape1 = shape.slice(0, shapeIndex);
			tmpShape2 = shape.slice(shapeIndex);
			tmpHole1 = hole.slice(holeIndex);
			tmpHole2 = hole.slice(0, holeIndex);

			var trianglea = [

				hole[holeIndex],
				shape[shapeIndex],
				shape[prevShapeVert]

			];

			var triangleb = [

				hole[holeIndex] ,
				hole[prevHoleVert],
				shape[shapeIndex]

			];

			verts.push(trianglea);
			verts.push(triangleb);

			shape = tmpShape1.concat(tmpHole1).concat(tmpHole2).concat(tmpShape2);
		}

		return {
			shape:shape, 		
			isolatedPts: verts, 
			allpoints: allpoints
		}
	},

	triangulateShape: function (contour, holes) {
		var shapeWithoutHoles = Shape.Utils.removeHoles(contour, holes);

		var shape = shapeWithoutHoles.shape,
			allpoints = shapeWithoutHoles.allpoints,
			isolatedPts = shapeWithoutHoles.isolatedPts;

		var triangles = FontUtils.Triangulate(shape, false);

		var i, il, f, face,
			key, index,
			allPointsMap = {},
			isolatedPointsMap = {};

		for (i = 0, il = allpoints.length; i < il; i ++) {
			key = allpoints[i].x + ":" + allpoints[i].y;

			if (allPointsMap[key] !== undefined) {
				console.log("Duplicate point", key);
			}

			allPointsMap[key] = i;
		}

		for (i = 0, il = triangles.length; i < il; i ++) {
			face = triangles[i];

			for (f = 0; f < 3; f ++) {
				key = face[f].x + ":" + face[f].y;

				index = allPointsMap[key];

				if (index !== undefined) {
					face[f] = index;
				}
			}
		}

		for (i = 0, il = isolatedPts.length; i < il; i ++) {
			face = isolatedPts[i];

			for (f = 0; f < 3; f ++) {
				key = face[f].x + ":" + face[f].y;

				index = allPointsMap[key];

				if (index !== undefined) {
					face[f] = index;
				}
			}
		}

		return triangles.concat(isolatedPts);
	},
	isClockWise: function (pts) {
		return FontUtils.Triangulate.area(pts) < 0;
	},

	b2p0: function (t, p) {
		var k = 1 - t;
		return k * k * p;
	},

	b2p1: function (t, p) {
		return 2 * (1 - t) * t * p;
	},

	b2p2: function (t, p) {
		return t * t * p;
	},

	b2: function (t, p0, p1, p2) {
		return this.b2p0(t, p0) + this.b2p1(t, p1) + this.b2p2(t, p2);
	},

	b3p0: function (t, p) {
		var k = 1 - t;
		return k * k * k * p;
	},

	b3p1: function (t, p) {
		var k = 1 - t;
		return 3 * k * k * t * p;
	},

	b3p2: function (t, p) {
		var k = 1 - t;
		return 3 * k * t * t * p;
	},

	b3p3: function (t, p) {
		return t * t * t * p;
	},

	b3: function (t, p0, p1, p2, p3) {
		return this.b3p0(t, p0) + this.b3p1(t, p1) + this.b3p2(t, p2) +  this.b3p3(t, p3);
	}
};