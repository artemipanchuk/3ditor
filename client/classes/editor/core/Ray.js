Ray = function (origin, direction) {
	this.origin = origin || new Vector3();
	this.direction = direction || new Vector3();

	var precision = 0.0001;

	this.setPrecision = function (value) {
		precision = value;
	};

	var a = new Vector3();
	var b = new Vector3();
	var c = new Vector3();
	var d = new Vector3();

	var originCopy = new Vector3();
	var directionCopy = new Vector3();

	var vector = new Vector3();
	var normal = new Vector3();
	var intersectPoint = new Vector3()

	this.intersectObject = function (object) {
		var intersect, intersects = [];

		if (object instanceof Particle) {
			var distance = distanceFromIntersection(this.origin, this.direction, object.matrixWorld.getPosition());

			if (distance > object.scale.x) {
				return [];
			}

			intersect = {
				distance: distance,
				point: object.position,
				face: null,
				object: object
			};

			intersects.push(intersect);
		} else if (object instanceof Mesh) {
			var distance = distanceFromIntersection(this.origin, this.direction, object.matrixWorld.getPosition());
			var scale = Frustum.__v1.set(object.matrixWorld.getColumnX().length(), object.matrixWorld.getColumnY().length(), object.matrixWorld.getColumnZ().length());

			if (distance > object.geometry.boundingSphere.radius * Math.max(scale.x, Math.max(scale.y, scale.z))) {
				return intersects;
			}

			var f, fl, face, dot, scalar,
			geometry = object.geometry,
			vertices = geometry.vertices,
			objMatrix;

			object.matrixRotationWorld.extractRotation(object.matrixWorld);

			for (f = 0, fl = geometry.faces.length; f < fl; f ++) {
				face = geometry.faces[f];

				originCopy.copy(this.origin);
				directionCopy.copy(this.direction);

				objMatrix = object.matrixWorld;

				vector = objMatrix.multiplyVector3(vector.copy(face.centroid)).subSelf(originCopy);
				normal = object.matrixRotationWorld.multiplyVector3(normal.copy(face.normal));
				dot = directionCopy.dot(normal);

				if (Math.abs(dot) < precision) continue;

				scalar = normal.dot(vector) / dot;

				if (scalar < 0) continue;

				if (object.doubleSided || (object.flipSided ? dot > 0 : dot < 0)) {
					intersectPoint.add(originCopy, directionCopy.multiplyScalar(scalar));

					if (face instanceof Face3) {
						a = objMatrix.multiplyVector3(a.copy(vertices[face.a]));
						b = objMatrix.multiplyVector3(b.copy(vertices[face.b]));
						c = objMatrix.multiplyVector3(c.copy(vertices[face.c]));

						if (pointInFace3(intersectPoint, a, b, c)) {
							intersect = {
								distance: originCopy.distanceTo(intersectPoint),
								point: intersectPoint.clone(),
								face: face,
								object: object
							};

							intersects.push(intersect);
						}
					} else if (face instanceof Face4) {
						a = objMatrix.multiplyVector3(a.copy(vertices[face.a]));
						b = objMatrix.multiplyVector3(b.copy(vertices[face.b]));
						c = objMatrix.multiplyVector3(c.copy(vertices[face.c]));
						d = objMatrix.multiplyVector3(d.copy(vertices[face.d]));

						if (pointInFace3(intersectPoint, a, b, d) || pointInFace3(intersectPoint, b, c, d)) {
							intersect = {
								distance: originCopy.distanceTo(intersectPoint),
								point: intersectPoint.clone(),
								face: face,
								object: object
							};

							intersects.push(intersect);
						}
					}
				}
			}
		}

		return intersects;
	}

	this.intersectObjects = function (objects) {
		var intersects = [];

		for (var i = 0, l = objects.length; i < l; i ++) {
			Array.prototype.push.apply(intersects, this.intersectObject(objects[i]));
		}

		intersects.sort(function (a, b) { return a.distance - b.distance; });

		return intersects;
	};

	var v0 = new Vector3(), v1 = new Vector3(), v2 = new Vector3();
	var dot, intersect, distance;

	function distanceFromIntersection(origin, direction, position) {
		v0.sub(position, origin);
		dot = v0.dot(direction);

		intersect = v1.add(origin, v2.copy(direction).multiplyScalar(dot));
		distance = position.distanceTo(intersect);

		return distance;
	}

	var dot00, dot01, dot02, dot11, dot12, invDenom, u, v;

	function pointInFace3(p, a, b, c) {
		v0.sub(c, a);
		v1.sub(b, a);
		v2.sub(p, a);

		dot00 = v0.dot(v0);
		dot01 = v0.dot(v1);
		dot02 = v0.dot(v2);
		dot11 = v1.dot(v1);
		dot12 = v1.dot(v2);

		invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
		u = (dot11 * dot02 - dot01 * dot12) * invDenom;
		v = (dot00 * dot12 - dot01 * dot02) * invDenom;

		return (u >= 0) && (v >= 0) && (u + v < 1);
	}
};