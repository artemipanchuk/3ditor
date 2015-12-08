ExtrudeGeometry = function(shapes, options) {
	if (typeof(shapes) === "undefined") {
		shapes = [];
		return;
	}

	Geometry.call(this);

	shapes = shapes instanceof Array ? shapes : [shapes];

	this.shapebb = shapes[shapes.length - 1].getBoundingBox();

	this.addShapeList(shapes, options);

	this.computeCentroids();
	this.computeFaceNormals();
};

ExtrudeGeometry.prototype = new Geometry();
ExtrudeGeometry.prototype.constructor = ExtrudeGeometry;

ExtrudeGeometry.prototype.addShapeList = function(shapes, options) {
	var sl = shapes.length;
	for (var s = 0; s < sl; s ++) {
		var shape = shapes[s];
		this.addShape(shape, options);
	}
};

ExtrudeGeometry.prototype.addShape = function(shape, options) {
	var amount = options.amount !== undefined ? options.amount : 100;

	var bevelThickness = options.bevelThickness !== undefined ? options.bevelThickness : 6;
	var bevelSize = options.bevelSize !== undefined ? options.bevelSize : bevelThickness - 2;
	var bevelSegments = options.bevelSegments !== undefined ? options.bevelSegments : 3;

	var bevelEnabled = options.bevelEnabled !== undefined ? options.bevelEnabled : true;

	var curveSegments = options.curveSegments !== undefined ? options.curveSegments : 12;

	var steps = options.steps !== undefined ? options.steps : 1;

	var bendPath = options.bendPath;

	var extrudePath = options.extrudePath;
	var extrudePts, extrudeByPath = false;

	var material = options.material;
	var extrudeMaterial = options.extrudeMaterial;

	var shapebb = this.shapebb;

	var splineTube, binormal, normal, position2;
	if (extrudePath) {
		extrudePts = extrudePath.getSpacedPoints(steps);

		extrudeByPath = true;
		bevelEnabled = false;
		splineTube = new TubeGeometry.FrenetFrames(extrudePath, steps, false);

		binormal = new Vector3();
		normal = new Vector3();
		position2 = new Vector3();
	}

	if (! bevelEnabled) {
		bevelSegments = 0;
		bevelThickness = 0;
		bevelSize = 0;
	}

	var ahole, h, hl;
	var scope = this;
	var bevelPoints = [];

	var shapesOffset = this.vertices.length;

	if (bendPath) {
		shape.addWrapPath(bendPath);
	}

	var shapePoints = shape.extractPoints();

    var vertices = shapePoints.shape;
	var holes = shapePoints.holes;

	var reverse = !Shape.Utils.isClockWise(vertices) ;

	if (reverse) {
		vertices = vertices.reverse();

		for (h = 0, hl = holes.length; h < hl; h ++) {
			ahole = holes[h];

			if (Shape.Utils.isClockWise(ahole)) {
				holes[h] = ahole.reverse();
			}
		}

		reverse = false;
	}

	var faces = Shape.Utils.triangulateShape (vertices, holes);

	var contour = vertices;

	for (h = 0, hl = holes.length;  h < hl; h ++) {
		ahole = holes[h];

		vertices = vertices.concat(ahole);
	}

	function scalePt2 (pt, vec, size) {
		if (!vec) console.log("die");

		return vec.clone().multiplyScalar(size).addSelf(pt);
	}

	var b, bs, t, z,
		vert, vlen = vertices.length,
		face, flen = faces.length,
		cont, clen = contour.length;

	var RAD_TO_DEGREES = 180 / Math.PI;

	function getBevelVec(pt_i, pt_j, pt_k) {
		return getBevelVec2(pt_i, pt_j, pt_k);
	}

	function getBevelVec1(pt_i, pt_j, pt_k) {
		var anglea = Math.atan2(pt_j.y - pt_i.y, pt_j.x - pt_i.x);
		var angleb = Math.atan2(pt_k.y - pt_i.y, pt_k.x - pt_i.x);

		if (anglea > angleb) {
			angleb += Math.PI * 2;
		}

		var anglec = (anglea + angleb) / 2;

		var x = - Math.cos(anglec);
		var y = - Math.sin(anglec);

		var vec = new Vector2(x, y);

		return vec;
	}

	function getBevelVec2(pt_i, pt_j, pt_k) {
		var a = ExtrudeGeometry.__v1,
			b = ExtrudeGeometry.__v2,
			v_hat = ExtrudeGeometry.__v3,
			w_hat = ExtrudeGeometry.__v4,
			p = ExtrudeGeometry.__v5,
			q = ExtrudeGeometry.__v6,
			v, w,
			v_dot_w_hat, q_sub_p_dot_w_hat,
			s, intersection;

		a.set(pt_i.x - pt_j.x, pt_i.y - pt_j.y);
		b.set(pt_i.x - pt_k.x, pt_i.y - pt_k.y);

		v = a.normalize();
		w = b.normalize();

		v_hat.set(-v.y, v.x);
		w_hat.set(w.y, -w.x);

		p.copy(pt_i).addSelf(v_hat);
		q.copy(pt_i).addSelf(w_hat);

		if (p.equals(q)) {
			return w_hat.clone();
		}

		p.copy(pt_j).addSelf(v_hat);
		q.copy(pt_k).addSelf(w_hat);

		v_dot_w_hat = v.dot(w_hat);
		q_sub_p_dot_w_hat = q.subSelf(p).dot(w_hat);

		if (v_dot_w_hat === 0) {
			console.log("Either infinite or no solutions!");

			if (q_sub_p_dot_w_hat === 0) {
				console.log("Its finite solutions.");
			} else {
				console.log("Too bad, no solutions.");
			}
		}

		s = q_sub_p_dot_w_hat / v_dot_w_hat;

		if (s < 0) {
			return getBevelVec1(pt_i, pt_j, pt_k);
		}

		intersection = v.multiplyScalar(s).addSelf(p);

		return intersection.subSelf(pt_i).clone();
	}

	var contourMovements = [];

	for (var i = 0, il = contour.length, j = il - 1, k = i + 1; i < il; i ++, j ++, k ++) {
		if (j === il) j = 0;
		if (k === il) k = 0;

		var pt_i = contour[i];
		var pt_j = contour[j];
		var pt_k = contour[k];

		contourMovements[i]= getBevelVec(contour[i], contour[j], contour[k]);
	}

	var holesMovements = [], oneHoleMovements, verticesMovements = contourMovements.concat();

	for (h = 0, hl = holes.length; h < hl; h ++) {
		ahole = holes[h];

		oneHoleMovements = [];

		for (i = 0, il = ahole.length, j = il - 1, k = i + 1; i < il; i ++, j ++, k ++) {
			if (j === il) j = 0;
			if (k === il) k = 0;
			oneHoleMovements[i]= getBevelVec(ahole[i], ahole[j], ahole[k]);
		}

		holesMovements.push(oneHoleMovements);
		verticesMovements = verticesMovements.concat(oneHoleMovements);
	}

	for (b = 0; b < bevelSegments; b ++) {
		t = b / bevelSegments;
		z = bevelThickness * (1 - t);
		bs = bevelSize * (Math.sin (t * Math.PI/2)) ;

		for (i = 0, il = contour.length; i < il; i ++) {
			vert = scalePt2(contour[i], contourMovements[i], bs);
			v(vert.x, vert.y,  - z);
		}

		for (h = 0, hl = holes.length; h < hl; h++) {
			ahole = holes[h];
			oneHoleMovements = holesMovements[h];

			for (i = 0, il = ahole.length; i < il; i++) {
				vert = scalePt2(ahole[i], oneHoleMovements[i], bs);

				v(vert.x, vert.y,  -z);
			}
		}
	}

	bs = bevelSize;

	for (i = 0; i < vlen; i ++) {
		vert = bevelEnabled ? scalePt2(vertices[i], verticesMovements[i], bs) : vertices[i];

		if (!extrudeByPath) {
			v(vert.x, vert.y, 0);
		} else {
			normal.copy(splineTube.normals[0]).multiplyScalar(vert.x);
			binormal.copy(splineTube.binormals[0]).multiplyScalar(vert.y);

			position2.copy(extrudePts[0]).addSelf(normal).addSelf(binormal);
			v(position2.x, position2.y, position2.z);
		}
	}

	var s;

	for (s = 1; s <= steps; s ++) {
		for (i = 0; i < vlen; i ++) {
			vert = bevelEnabled ? scalePt2(vertices[i], verticesMovements[i], bs) : vertices[i];

			if (!extrudeByPath) {
				v(vert.x, vert.y, amount / steps * s);
			} else {
				normal.copy(splineTube.normals[s]).multiplyScalar(vert.x);
				binormal.copy(splineTube.binormals[s]).multiplyScalar(vert.y);

				position2.copy(extrudePts[s]).addSelf(normal).addSelf(binormal);

				v(position2.x, position2.y, position2.z);
			}
		}
	}
	for (b = bevelSegments - 1; b >= 0; b --) {
		t = b / bevelSegments;
		z = bevelThickness * (1 - t);
		bs = bevelSize * Math.sin (t * Math.PI/2) ;

		for (i = 0, il = contour.length; i < il; i ++) {
			vert = scalePt2(contour[i], contourMovements[i], bs);
			v(vert.x, vert.y,  amount + z);
		}

		for (h = 0, hl = holes.length; h < hl; h ++) {
			ahole = holes[h];
			oneHoleMovements = holesMovements[h];

			for (i = 0, il = ahole.length; i < il; i++) {
				vert = scalePt2(ahole[i], oneHoleMovements[i], bs);

				if (!extrudeByPath) {
					v(vert.x, vert.y,  amount + z);
				} else {
					v(vert.x, vert.y + extrudePts[steps - 1].y, extrudePts[steps - 1].x + z);
				}
			}
		}
	}
	var uvgen = ExtrudeGeometry.WorldUVGenerator;
	buildLidFaces();
	buildSideFaces();

	function buildLidFaces() {
		if (bevelEnabled) {
			var layer = 0 ;
			var offset = vlen * layer;
			for (i = 0; i < flen; i ++) {
				face = faces[i];
				f3(face[2]+ offset, face[1]+ offset, face[0] + offset, true);
			}

			layer = steps + bevelSegments * 2;
			offset = vlen * layer;

			for (i = 0; i < flen; i ++) {
				face = faces[i];
				f3(face[0] + offset, face[1] + offset, face[2] + offset, false);
			}
		} else {
			for (i = 0; i < flen; i++) {
				face = faces[i];
				f3(face[2], face[1], face[0], true);
			}

			for (i = 0; i < flen; i ++) {
				face = faces[i];
				f3(face[0] + vlen * steps, face[1] + vlen * steps, face[2] + vlen * steps, false);
			}
		}
	}

	function buildSideFaces() {
		var layeroffset = 0;
		sidewalls(contour, layeroffset);
		layeroffset += contour.length;

		for (h = 0, hl = holes.length;  h < hl; h ++) {
			ahole = holes[h];
			sidewalls(ahole, layeroffset);
			layeroffset += ahole.length;
		}
	}

	function sidewalls(contour, layeroffset) {
		var j, k;
		i = contour.length;

		while (--i >= 0) {
			j = i;
			k = i - 1;
			if (k < 0) k = contour.length - 1;

			var s = 0, sl = steps  + bevelSegments * 2;

			for (s = 0; s < sl; s ++) {
				var slen1 = vlen * s;
				var slen2 = vlen * (s + 1);
				var a = layeroffset + j + slen1,
					b = layeroffset + k + slen1,
					c = layeroffset + k + slen2,
					d = layeroffset + j + slen2;

				f4(a, b, c, d, contour, s, sl);
			}
		}
	}

	function v(x, y, z) {
		scope.vertices.push(new Vector3(x, y, z));
	}

	function f3(a, b, c, isBottom) {
		a += shapesOffset;
		b += shapesOffset;
		c += shapesOffset;
		scope.faces.push(new Face3(a, b, c, null, null, material));

		var uvs = isBottom ? uvgen.generateBottomUV(scope, shape, options, a, b, c)
		                   : uvgen.generateTopUV(scope, shape, options, a, b, c);

 		scope.faceVertexUvs[0].push(uvs);
	}

	function f4(a, b, c, d, wallContour, stepIndex, stepsLength) {
		a += shapesOffset;
		b += shapesOffset;
		c += shapesOffset;
		d += shapesOffset;

 		scope.faces.push(new Face4(a, b, c, d, null, null, extrudeMaterial));
 
 		var uvs = uvgen.generateSideWallUV(scope, shape, wallContour, options, a, b, c, d, stepIndex, stepsLength);
 		scope.faceVertexUvs[0].push(uvs);
	}
};

ExtrudeGeometry.WorldUVGenerator = {
	generateTopUV: function(geometry, extrudedShape, extrudeOptions, indexA, indexB, indexC) {
		var ax = geometry.vertices[indexA].x,
			ay = geometry.vertices[indexA].y,

			bx = geometry.vertices[indexB].x,
			by = geometry.vertices[indexB].y,

			cx = geometry.vertices[indexC].x,
			cy = geometry.vertices[indexC].y;
		return [
			new UV(ax, 1 - ay),
			new UV(bx, 1 - by),
			new UV(cx, 1 - cy)
		];
	},

	generateBottomUV: function(geometry, extrudedShape, extrudeOptions, indexA, indexB, indexC) {
		return this.generateTopUV(geometry, extrudedShape, extrudeOptions, indexA, indexB, indexC);
	},

	generateSideWallUV: function(geometry, extrudedShape, wallContour, extrudeOptions,
	                              indexA, indexB, indexC, indexD, stepIndex, stepsLength) {
		var ax = geometry.vertices[indexA].x,
			ay = geometry.vertices[indexA].y,
			az = geometry.vertices[indexA].z,

			bx = geometry.vertices[indexB].x,
			by = geometry.vertices[indexB].y,
			bz = geometry.vertices[indexB].z,

			cx = geometry.vertices[indexC].x,
			cy = geometry.vertices[indexC].y,
			cz = geometry.vertices[indexC].z,

			dx = geometry.vertices[indexD].x,
			dy = geometry.vertices[indexD].y,
			dz = geometry.vertices[indexD].z;
		if (Math.abs(ay - by) < 0.01) {
			return [
				new UV(ax, az),
				new UV(bx, bz),
				new UV(cx, cz),
				new UV(dx, dz)
			];
		} else {
			return [
				new UV(ay, az),
				new UV(by, bz),
				new UV(cy, cz),
				new UV(dy, dz)
			];
		}
	}
};

ExtrudeGeometry.__v1 = new Vector2();
ExtrudeGeometry.__v2 = new Vector2();
ExtrudeGeometry.__v3 = new Vector2();
ExtrudeGeometry.__v4 = new Vector2();
ExtrudeGeometry.__v5 = new Vector2();
ExtrudeGeometry.__v6 = new Vector2();