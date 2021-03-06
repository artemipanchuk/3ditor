Geometry = function () {
	this.id = GeometryCount ++;

	this.vertices = [];
	this.colors = [];

	this.materials = [];

	this.faces = [];

	this.faceUvs = [[]];
	this.faceVertexUvs = [[]];

	this.morphTargets = [];
	this.morphColors = [];
	this.morphNormals = [];

	this.skinWeights = [];
	this.skinIndices = [];

	this.boundingBox = null;
	this.boundingSphere = null;

	this.hasTangents = false;

	this.dynamic = false;
};

Geometry.prototype = {
	constructor : Geometry,

	applyMatrix: function (matrix) {
		var matrixRotation = new Matrix4();
		matrixRotation.extractRotation(matrix);

		for (var i = 0, il = this.vertices.length; i < il; i ++) {
			var vertex = this.vertices[i];

			matrix.multiplyVector3(vertex);
		}

		for (var i = 0, il = this.faces.length; i < il; i ++) {
			var face = this.faces[i];

			matrixRotation.multiplyVector3(face.normal);

			for (var j = 0, jl = face.vertexNormals.length; j < jl; j ++) {
				matrixRotation.multiplyVector3(face.vertexNormals[j]);
			}

			matrix.multiplyVector3(face.centroid);
		}
	},

	computeCentroids: function () {
		var f, fl, face;

		for (f = 0, fl = this.faces.length; f < fl; f ++) {
			face = this.faces[f];
			face.centroid.set(0, 0, 0);

			if (face instanceof Face3) {
				face.centroid.addSelf(this.vertices[face.a]);
				face.centroid.addSelf(this.vertices[face.b]);
				face.centroid.addSelf(this.vertices[face.c]);
				face.centroid.divideScalar(3);
			} else if (face instanceof Face4) {
				face.centroid.addSelf(this.vertices[face.a]);
				face.centroid.addSelf(this.vertices[face.b]);
				face.centroid.addSelf(this.vertices[face.c]);
				face.centroid.addSelf(this.vertices[face.d]);
				face.centroid.divideScalar(4);
			}
		}
	},

	computeFaceNormals: function () {
		var n, nl, v, vl, vertex, f, fl, face, vA, vB, vC,
		cb = new Vector3(), ab = new Vector3();

		for (f = 0, fl = this.faces.length; f < fl; f ++) {
			face = this.faces[f];

			vA = this.vertices[face.a];
			vB = this.vertices[face.b];
			vC = this.vertices[face.c];

			cb.sub(vC, vB);
			ab.sub(vA, vB);
			cb.crossSelf(ab);

			if (!cb.isZero()) {
				cb.normalize();
			}

			face.normal.copy(cb);
		}
	},

	computeVertexNormals: function () {
		var v, vl, f, fl, face, vertices;

		if (this.__tmpVertices === undefined) {
			this.__tmpVertices = new Array(this.vertices.length);
			vertices = this.__tmpVertices;

			for (v = 0, vl = this.vertices.length; v < vl; v ++) {
				vertices[v] = new Vector3();
			}

			for (f = 0, fl = this.faces.length; f < fl; f ++) {
				face = this.faces[f];

				if (face instanceof Face3) {
					face.vertexNormals = [new Vector3(), new Vector3(), new Vector3()];
				} else if (face instanceof Face4) {
					face.vertexNormals = [new Vector3(), new Vector3(), new Vector3(), new Vector3()];
				}
			}
		} else {
			vertices = this.__tmpVertices;

			for (v = 0, vl = this.vertices.length; v < vl; v ++) {
				vertices[v].set(0, 0, 0);
			}
		}

		for (f = 0, fl = this.faces.length; f < fl; f ++) {
			face = this.faces[f];

			if (face instanceof Face3) {
				vertices[face.a].addSelf(face.normal);
				vertices[face.b].addSelf(face.normal);
				vertices[face.c].addSelf(face.normal);
			} else if (face instanceof Face4) {
				vertices[face.a].addSelf(face.normal);
				vertices[face.b].addSelf(face.normal);
				vertices[face.c].addSelf(face.normal);
				vertices[face.d].addSelf(face.normal);
			}
		}

		for (v = 0, vl = this.vertices.length; v < vl; v ++) {
			vertices[v].normalize();
		}

		for (f = 0, fl = this.faces.length; f < fl; f ++) {
			face = this.faces[f];

			if (face instanceof Face3) {
				face.vertexNormals[0].copy(vertices[face.a]);
				face.vertexNormals[1].copy(vertices[face.b]);
				face.vertexNormals[2].copy(vertices[face.c]);
			} else if (face instanceof Face4) {
				face.vertexNormals[0].copy(vertices[face.a]);
				face.vertexNormals[1].copy(vertices[face.b]);
				face.vertexNormals[2].copy(vertices[face.c]);
				face.vertexNormals[3].copy(vertices[face.d]);
			}
		}
	},

	computeMorphNormals: function () {
		var i, il, f, fl, face;

		for (f = 0, fl = this.faces.length; f < fl; f ++) {
			face = this.faces[f];

			if (! face.__originalFaceNormal) {
				face.__originalFaceNormal = face.normal.clone();
			} else {
				face.__originalFaceNormal.copy(face.normal);
			}

			if (! face.__originalVertexNormals) face.__originalVertexNormals = [];

			for (i = 0, il = face.vertexNormals.length; i < il; i ++) {
				if (! face.__originalVertexNormals[i]) {
					face.__originalVertexNormals[i] = face.vertexNormals[i].clone();
				} else {
					face.__originalVertexNormals[i].copy(face.vertexNormals[i]);
				}
			}
		}

		var tmpGeo = new Geometry();
		tmpGeo.faces = this.faces;

		for (i = 0, il = this.morphTargets.length; i < il; i ++) {
			if (! this.morphNormals[i]) {
				this.morphNormals[i] = {};
				this.morphNormals[i].faceNormals = [];
				this.morphNormals[i].vertexNormals = [];

				var dstNormalsFace = this.morphNormals[i].faceNormals;
				var dstNormalsVertex = this.morphNormals[i].vertexNormals;

				var faceNormal, vertexNormals;

				for (f = 0, fl = this.faces.length; f < fl; f ++) {
					face = this.faces[f];

					faceNormal = new Vector3();

					if (face instanceof Face3) {
						vertexNormals = { a: new Vector3(), b: new Vector3(), c: new Vector3() };
					} else {
						vertexNormals = { a: new Vector3(), b: new Vector3(), c: new Vector3(), d: new Vector3() };
					}

					dstNormalsFace.push(faceNormal);
					dstNormalsVertex.push(vertexNormals);
				}
			}

			var morphNormals = this.morphNormals[i];

			tmpGeo.vertices = this.morphTargets[i].vertices;

			tmpGeo.computeFaceNormals();
			tmpGeo.computeVertexNormals();

			var faceNormal, vertexNormals;

			for (f = 0, fl = this.faces.length; f < fl; f ++) {
				face = this.faces[f];

				faceNormal = morphNormals.faceNormals[f];
				vertexNormals = morphNormals.vertexNormals[f];

				faceNormal.copy(face.normal);

				if (face instanceof Face3) {
					vertexNormals.a.copy(face.vertexNormals[0]);
					vertexNormals.b.copy(face.vertexNormals[1]);
					vertexNormals.c.copy(face.vertexNormals[2]);
				} else {
					vertexNormals.a.copy(face.vertexNormals[0]);
					vertexNormals.b.copy(face.vertexNormals[1]);
					vertexNormals.c.copy(face.vertexNormals[2]);
					vertexNormals.d.copy(face.vertexNormals[3]);
				}
			}
		}

		for (f = 0, fl = this.faces.length; f < fl; f ++) {
			face = this.faces[f];

			face.normal = face.__originalFaceNormal;
			face.vertexNormals = face.__originalVertexNormals;
		}
	},

	computeTangents: function () {
		var f, fl, v, vl, i, il, vertexIndex,
			face, uv, vA, vB, vC, uvA, uvB, uvC,
			x1, x2, y1, y2, z1, z2,
			s1, s2, t1, t2, r, t, test,
			tan1 = [], tan2 = [],
			sdir = new Vector3(), tdir = new Vector3(),
			tmp = new Vector3(), tmp2 = new Vector3(),
			n = new Vector3(), w;

		for (v = 0, vl = this.vertices.length; v < vl; v ++) {
			tan1[v] = new Vector3();
			tan2[v] = new Vector3();
		}

		function handleTriangle(context, a, b, c, ua, ub, uc) {
			vA = context.vertices[a];
			vB = context.vertices[b];
			vC = context.vertices[c];

			uvA = uv[ua];
			uvB = uv[ub];
			uvC = uv[uc];

			x1 = vB.x - vA.x;
			x2 = vC.x - vA.x;
			y1 = vB.y - vA.y;
			y2 = vC.y - vA.y;
			z1 = vB.z - vA.z;
			z2 = vC.z - vA.z;

			s1 = uvB.u - uvA.u;
			s2 = uvC.u - uvA.u;
			t1 = uvB.v - uvA.v;
			t2 = uvC.v - uvA.v;

			r = 1.0 / (s1 * t2 - s2 * t1);
			sdir.set((t2 * x1 - t1 * x2) * r,
					  (t2 * y1 - t1 * y2) * r,
					  (t2 * z1 - t1 * z2) * r);
			tdir.set((s1 * x2 - s2 * x1) * r,
					  (s1 * y2 - s2 * y1) * r,
					  (s1 * z2 - s2 * z1) * r);

			tan1[a].addSelf(sdir);
			tan1[b].addSelf(sdir);
			tan1[c].addSelf(sdir);

			tan2[a].addSelf(tdir);
			tan2[b].addSelf(tdir);
			tan2[c].addSelf(tdir);
		}

		for (f = 0, fl = this.faces.length; f < fl; f ++) {
			face = this.faces[f];
			uv = this.faceVertexUvs[0][f];

			if (face instanceof Face3) {
				handleTriangle(this, face.a, face.b, face.c, 0, 1, 2);
			} else if (face instanceof Face4) {
				handleTriangle(this, face.a, face.b, face.d, 0, 1, 3);
				handleTriangle(this, face.b, face.c, face.d, 1, 2, 3);
			}
		}

		var faceIndex = ['a', 'b', 'c', 'd'];

		for (f = 0, fl = this.faces.length; f < fl; f ++) {
			face = this.faces[f];

			for (i = 0; i < face.vertexNormals.length; i++) {
				n.copy(face.vertexNormals[i]);

				vertexIndex = face[faceIndex[i]];

				t = tan1[vertexIndex];

				tmp.copy(t);
				tmp.subSelf(n.multiplyScalar(n.dot(t))).normalize();

				tmp2.cross(face.vertexNormals[i], t);
				test = tmp2.dot(tan2[vertexIndex]);
				w = (test < 0.0) ? -1.0 : 1.0;

				face.vertexTangents[i] = new Vector4(tmp.x, tmp.y, tmp.z, w);
			}
		}

		this.hasTangents = true;
	},

	computeBoundingBox: function () {
		if (! this.boundingBox) {
			this.boundingBox = { min: new Vector3(), max: new Vector3() };
		}

		if (this.vertices.length > 0) {
			var position, firstPosition = this.vertices[0];

			this.boundingBox.min.copy(firstPosition);
			this.boundingBox.max.copy(firstPosition);

			var min = this.boundingBox.min,
				max = this.boundingBox.max;

			for (var v = 1, vl = this.vertices.length; v < vl; v ++) {
				position = this.vertices[v];

				if (position.x < min.x) {
					min.x = position.x;
				} else if (position.x > max.x) {
					max.x = position.x;
				}

				if (position.y < min.y) {
					min.y = position.y;
				} else if (position.y > max.y) {
					max.y = position.y;
				}

				if (position.z < min.z) {
					min.z = position.z;
				} else if (position.z > max.z) {
					max.z = position.z;
				}
			}
		} else {
			this.boundingBox.min.set(0, 0, 0);
			this.boundingBox.max.set(0, 0, 0);
		}
	},

	computeBoundingSphere: function () {
		if (! this.boundingSphere) this.boundingSphere = { radius: 0 };

		var radius, maxRadius = 0;

		for (var v = 0, vl = this.vertices.length; v < vl; v ++) {
			radius = this.vertices[v].length();
			if (radius > maxRadius) maxRadius = radius;
		}

		this.boundingSphere.radius = maxRadius;
	},
	mergeVertices: function() {
		var verticesMap = {};
		var unique = [], changes = [];

		var v, key;
		var precisionPoints = 4;
		var precision = Math.pow(10, precisionPoints);
		var i,il, face;
		var abcd = 'abcd', o, k, j, jl, u;

		for (i = 0, il = this.vertices.length; i < il; i ++) {
			v = this.vertices[i];
			key = [Math.round(v.x * precision), Math.round(v.y * precision), Math.round(v.z * precision)].join('_');

			if (verticesMap[key] === undefined) {
				verticesMap[key] = i;
				unique.push(this.vertices[i]);
				changes[i] = unique.length - 1;
			} else {
				changes[i] = changes[verticesMap[key]];
			}
		};

		for(i = 0, il = this.faces.length; i < il; i ++) {
			face = this.faces[i];

			if (face instanceof Face3) {
				face.a = changes[face.a];
				face.b = changes[face.b];
				face.c = changes[face.c];
			} else if (face instanceof Face4) {
				face.a = changes[face.a];
				face.b = changes[face.b];
				face.c = changes[face.c];
				face.d = changes[face.d];
				o = [face.a, face.b, face.c, face.d];
				for (k=3;k>0;k--) {
					if (o.indexOf(face[abcd[k]]) != k) {
						o.splice(k, 1);
						this.faces[i] = new Face3(o[0], o[1], o[2]);
						for (j=0,jl=this.faceVertexUvs.length;j<jl;j++) {
							u = this.faceVertexUvs[j][i];
							if (u) u.splice(k, 1);
						}
						break;
					}
				}
			}
		}
		var diff = this.vertices.length - unique.length;
		this.vertices = unique;
		return diff;
	}
};

GeometryCount = 0;