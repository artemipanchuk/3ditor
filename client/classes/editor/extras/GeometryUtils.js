GeometryUtils = {
	merge: function (geometry1, object2 ) {
		var matrix, matrixRotation,
		vertexOffset = geometry1.vertices.length,
		uvPosition = geometry1.faceVertexUvs[0].length,
		geometry2 = object2 instanceof Mesh ? object2.geometry : object2,
		vertices1 = geometry1.vertices,
		vertices2 = geometry2.vertices,
		faces1 = geometry1.faces,
		faces2 = geometry2.faces,
		uvs1 = geometry1.faceVertexUvs[0],
		uvs2 = geometry2.faceVertexUvs[0];

		var geo1MaterialsMap = {};

		for (var i = 0; i < geometry1.materials.length; i ++) {
			var id = geometry1.materials[i].id;

			geo1MaterialsMap[id] = i;
		}

		if (object2 instanceof Mesh) {
			object2.matrixAutoUpdate && object2.updateMatrix();

			matrix = object2.matrix;
			matrixRotation = new Matrix4();
			matrixRotation.extractRotation(matrix, object2.scale);
		}

		for (var i = 0, il = vertices2.length; i < il; i ++) {
			var vertex = vertices2[i];

			var vertexCopy = vertex.clone();

			if (matrix) matrix.multiplyVector3(vertexCopy);

			vertices1.push(vertexCopy);
		}

		for (i = 0, il = faces2.length; i < il; i ++) {
			var face = faces2[i], faceCopy, normal, color,
			faceVertexNormals = face.vertexNormals,
			faceVertexColors = face.vertexColors;

			if (face instanceof Face3) {
				faceCopy = new Face3(face.a + vertexOffset, face.b + vertexOffset, face.c + vertexOffset);
			} else if (face instanceof Face4) {
				faceCopy = new Face4(face.a + vertexOffset, face.b + vertexOffset, face.c + vertexOffset, face.d + vertexOffset);
			}

			faceCopy.normal.copy(face.normal);

			if (matrixRotation) matrixRotation.multiplyVector3(faceCopy.normal);

			for (var j = 0, jl = faceVertexNormals.length; j < jl; j ++) {
				normal = faceVertexNormals[j].clone();

				if (matrixRotation) matrixRotation.multiplyVector3(normal);

				faceCopy.vertexNormals.push(normal);
			}

			faceCopy.color.copy(face.color);

			for (var j = 0, jl = faceVertexColors.length; j < jl; j ++) {
				color = faceVertexColors[j];
				faceCopy.vertexColors.push(color.clone());
			}

			if (face.materialIndex !== undefined) {
				var material2 = geometry2.materials[face.materialIndex];
				var materialId2 = material2.id;

				var materialIndex = geo1MaterialsMap[materialId2];

				if (materialIndex === undefined) {
					materialIndex = geometry1.materials.length;
					geo1MaterialsMap[materialId2] = materialIndex;

					geometry1.materials.push(material2);
				}

				faceCopy.materialIndex = materialIndex;
			}

			faceCopy.centroid.copy(face.centroid);
			if (matrix) matrix.multiplyVector3(faceCopy.centroid);

			faces1.push(faceCopy);
		}

		for (i = 0, il = uvs2.length; i < il; i ++) {
			var uv = uvs2[i], uvCopy = [];

			for (var j = 0, jl = uv.length; j < jl; j ++) {
				uvCopy.push(new UV(uv[j].u, uv[j].v));
			}

			uvs1.push(uvCopy);
		}
	},

	clone: function (geometry) {
		var cloneGeo = new Geometry();

		var i, il;

		var vertices = geometry.vertices,
			faces = geometry.faces,
			uvs = geometry.faceVertexUvs[0];

		if (geometry.materials) {
			cloneGeo.materials = geometry.materials.slice();
		}

		for (i = 0, il = vertices.length; i < il; i ++) {
			var vertex = vertices[i];

			cloneGeo.vertices.push(vertex.clone());
		}

		for (i = 0, il = faces.length; i < il; i ++) {
			var face = faces[i];

			cloneGeo.faces.push(face.clone());
		}

		for (i = 0, il = uvs.length; i < il; i ++) {
			var uv = uvs[i], uvCopy = [];

			for (var j = 0, jl = uv.length; j < jl; j ++) {
				uvCopy.push(new UV(uv[j].u, uv[j].v));
			}

			cloneGeo.faceVertexUvs[0].push(uvCopy);
		}

		return cloneGeo;
	},

	randomPointInTriangle: function (vectorA, vectorB, vectorC) {
		var a, b, c,
			point = new Vector3(),
			tmp = GeometryUtils.__v1;

		a = GeometryUtils.random();
		b = GeometryUtils.random();

		if ((a + b) > 1) {
			a = 1 - a;
			b = 1 - b;
		}

		c = 1 - a - b;

		point.copy(vectorA);
		point.multiplyScalar(a);

		tmp.copy(vectorB);
		tmp.multiplyScalar(b);

		point.addSelf(tmp);

		tmp.copy(vectorC);
		tmp.multiplyScalar(c);

		point.addSelf(tmp);

		return point;
	},

	randomPointInFace: function (face, geometry, useCachedAreas) {
		var vA, vB, vC, vD;

		if (face instanceof Face3) {
			vA = geometry.vertices[face.a];
			vB = geometry.vertices[face.b];
			vC = geometry.vertices[face.c];

			return GeometryUtils.randomPointInTriangle(vA, vB, vC);
		} else if (face instanceof Face4) {
			vA = geometry.vertices[face.a];
			vB = geometry.vertices[face.b];
			vC = geometry.vertices[face.c];
			vD = geometry.vertices[face.d];

			var area1, area2;

			if (useCachedAreas) {
				if (face._area1 && face._area2) {
					area1 = face._area1;
					area2 = face._area2;
				} else {
					area1 = GeometryUtils.triangleArea(vA, vB, vD);
					area2 = GeometryUtils.triangleArea(vB, vC, vD);

					face._area1 = area1;
					face._area2 = area2;
				}
			} else {
				area1 = GeometryUtils.triangleArea(vA, vB, vD),
				area2 = GeometryUtils.triangleArea(vB, vC, vD);
			}

			var r = GeometryUtils.random() * (area1 + area2);

			if (r < area1) {
				return GeometryUtils.randomPointInTriangle(vA, vB, vD);
			} else {
				return GeometryUtils.randomPointInTriangle(vB, vC, vD);
			}
		}
	},

	randomPointsInGeometry: function (geometry, n) {
		var face, i,
			faces = geometry.faces,
			vertices = geometry.vertices,
			il = faces.length,
			totalArea = 0,
			cumulativeAreas = [],
			vA, vB, vC, vD;

		for (i = 0; i < il; i ++) {
			face = faces[i];

			if (face instanceof Face3) {
				vA = vertices[face.a];
				vB = vertices[face.b];
				vC = vertices[face.c];

				face._area = GeometryUtils.triangleArea(vA, vB, vC);
			} else if (face instanceof Face4) {
				vA = vertices[face.a];
				vB = vertices[face.b];
				vC = vertices[face.c];
				vD = vertices[face.d];

				face._area1 = GeometryUtils.triangleArea(vA, vB, vD);
				face._area2 = GeometryUtils.triangleArea(vB, vC, vD);

				face._area = face._area1 + face._area2;
			}

			totalArea += face._area;

			cumulativeAreas[i] = totalArea;
		}

		function binarySearchIndices(value) {
			function binarySearch(start, end) {
				if (end < start)
					return start;

				var mid = start + Math.floor((end - start) / 2);

				if (cumulativeAreas[mid] > value) {
					return binarySearch(start, mid - 1);
				} else if (cumulativeAreas[mid] < value) {
					return binarySearch(mid + 1, end);
				} else {
					return mid;
				}
			}

			var result = binarySearch(0, cumulativeAreas.length - 1)
			return result;
		}

		var r, index,
			result = [];

		var stats = {};

		for (i = 0; i < n; i ++) {
			r = GeometryUtils.random() * totalArea;

			index = binarySearchIndices(r);

			result[i] = GeometryUtils.randomPointInFace(faces[index], geometry, true);

			if (! stats[index]) {
				stats[index] = 1;
			} else {
				stats[index] += 1;
			}
		}

		return result;
	},

	triangleArea: function (vectorA, vectorB, vectorC) {
		var s, a, b, c,
			tmp = GeometryUtils.__v1;

		tmp.sub(vectorA, vectorB);
		a = tmp.length();

		tmp.sub(vectorA, vectorC);
		b = tmp.length();

		tmp.sub(vectorB, vectorC);
		c = tmp.length();

		s = 0.5 * (a + b + c);

		return Math.sqrt(s * (s - a) * (s - b) * (s - c));
	},

	center: function (geometry) {
		geometry.computeBoundingBox();

		var bb = geometry.boundingBox;

		var offset = new Vector3();

		offset.add(bb.min, bb.max);
		offset.multiplyScalar(-0.5);

		geometry.applyMatrix(new Matrix4().makeTranslation(offset.x, offset.y, offset.z));
		geometry.computeBoundingBox();

		return offset;
	},

	normalizeUVs: function (geometry) {
		var uvSet = geometry.faceVertexUvs[0];

		for (var i = 0, il = uvSet.length; i < il; i ++) {
			var uvs = uvSet[i];

			for (var j = 0, jl = uvs.length; j < jl; j ++) {
				if(uvs[j].u !== 1.0) uvs[j].u = uvs[j].u - Math.floor(uvs[j].u);
				if(uvs[j].v !== 1.0) uvs[j].v = uvs[j].v - Math.floor(uvs[j].v);
			}
		}
	},

	triangulateQuads: function (geometry) {
		var i, il, j, jl;

		var faces = [];
		var faceUvs = [];
		var faceVertexUvs = [];

		for (i = 0, il = geometry.faceUvs.length; i < il; i ++) {
			faceUvs[i] = [];
		}

		for (i = 0, il = geometry.faceVertexUvs.length; i < il; i ++) {
			faceVertexUvs[i] = [];
		}

		for (i = 0, il = geometry.faces.length; i < il; i ++) {
			var face = geometry.faces[i];

			if (face instanceof Face4) {
				var a = face.a;
				var b = face.b;
				var c = face.c;
				var d = face.d;

				var triA = new Face3();
				var triB = new Face3();

				triA.color.copy(face.color);
				triB.color.copy(face.color);

				triA.materialIndex = face.materialIndex;
				triB.materialIndex = face.materialIndex;

				triA.a = a;
				triA.b = b;
				triA.c = d;

				triB.a = b;
				triB.b = c;
				triB.c = d;

				if (face.vertexColors.length === 4) {
					triA.vertexColors[0] = face.vertexColors[0].clone();
					triA.vertexColors[1] = face.vertexColors[1].clone();
					triA.vertexColors[2] = face.vertexColors[3].clone();

					triB.vertexColors[0] = face.vertexColors[1].clone();
					triB.vertexColors[1] = face.vertexColors[2].clone();
					triB.vertexColors[2] = face.vertexColors[3].clone();
				}

				faces.push(triA, triB);

				for (j = 0, jl = geometry.faceVertexUvs.length; j < jl; j ++) {
					if (geometry.faceVertexUvs[j].length) {
						var uvs = geometry.faceVertexUvs[j][i];

						var uvA = uvs[0];
						var uvB = uvs[1];
						var uvC = uvs[2];
						var uvD = uvs[3];

						var uvsTriA = [uvA.clone(), uvB.clone(), uvD.clone()];
						var uvsTriB = [uvB.clone(), uvC.clone(), uvD.clone()];

						faceVertexUvs[j].push(uvsTriA, uvsTriB);
					}
				}

				for (j = 0, jl = geometry.faceUvs.length; j < jl; j ++) {
					if (geometry.faceUvs[j].length) {
						var faceUv = geometry.faceUvs[j][i];

						faceUvs[j].push(faceUv, faceUv);
					}
				}
			} else {
				faces.push(face);

				for (j = 0, jl = geometry.faceUvs.length; j < jl; j ++) {
					faceUvs[j].push(geometry.faceUvs[j]);
				}

				for (j = 0, jl = geometry.faceVertexUvs.length; j < jl; j ++) {
					faceVertexUvs[j].push(geometry.faceVertexUvs[j]);
				}
			}
		}

		geometry.faces = faces;
		geometry.faceUvs = faceUvs;
		geometry.faceVertexUvs = faceVertexUvs;

		geometry.computeCentroids();
		geometry.computeFaceNormals();
		geometry.computeVertexNormals();

		if (geometry.hasTangents) geometry.computeTangents();
	},

	explode: function(geometry) {
		var vertices = [];

		for (var i = 0, il = geometry.faces.length; i < il; i ++) {
			var n = vertices.length;

			var face = geometry.faces[i];

			if (face instanceof Face4) {
				var a = face.a;
				var b = face.b;
				var c = face.c;
				var d = face.d;

				var va = geometry.vertices[a];
				var vb = geometry.vertices[b];
				var vc = geometry.vertices[c];
				var vd = geometry.vertices[d];

				vertices.push(va.clone());
				vertices.push(vb.clone());
				vertices.push(vc.clone());
				vertices.push(vd.clone());

				face.a = n;
				face.b = n + 1;
				face.c = n + 2;
				face.d = n + 3;
			} else {
				var a = face.a;
				var b = face.b;
				var c = face.c;

				var va = geometry.vertices[a];
				var vb = geometry.vertices[b];
				var vc = geometry.vertices[c];

				vertices.push(va.clone());
				vertices.push(vb.clone());
				vertices.push(vc.clone());

				face.a = n;
				face.b = n + 1;
				face.c = n + 2;
			}
		}

		geometry.vertices = vertices;
		delete geometry.__tmpVertices;
	},

	tessellate: function (geometry, maxEdgeLength) {
		var i, il, face,
		a, b, c, d,
		va, vb, vc, vd,
		dab, dbc, dac, dcd, dad,
		m, m1, m2,
		vm, vm1, vm2,
		vnm, vnm1, vnm2,
		vcm, vcm1, vcm2,
		triA, triB,
		quadA, quadB,
		edge;

		var faces = [];
		var faceVertexUvs = [];

		for (i = 0, il = geometry.faceVertexUvs.length; i < il; i ++) {
			faceVertexUvs[i] = [];
		}

		for (i = 0, il = geometry.faces.length; i < il; i ++) {
			face = geometry.faces[i];

			if (face instanceof Face3) {
				a = face.a;
				b = face.b;
				c = face.c;

				va = geometry.vertices[a];
				vb = geometry.vertices[b];
				vc = geometry.vertices[c];

				dab = va.distanceTo(vb);
				dbc = vb.distanceTo(vc);
				dac = va.distanceTo(vc);

				if (dab > maxEdgeLength || dbc > maxEdgeLength || dac > maxEdgeLength) {
					m = geometry.vertices.length;

					triA = face.clone();
					triB = face.clone();

					if (dab >= dbc && dab >= dac) {
						vm = va.clone();
						vm.lerpSelf(vb, 0.5);

						triA.a = a;
						triA.b = m;
						triA.c = c;

						triB.a = m;
						triB.b = b;
						triB.c = c;

						if (face.vertexNormals.length === 3) {
							vnm = face.vertexNormals[0].clone();
							vnm.lerpSelf(face.vertexNormals[1], 0.5);

							triA.vertexNormals[1].copy(vnm);
							triB.vertexNormals[0].copy(vnm);
						}

						if (face.vertexColors.length === 3) {
							vcm = face.vertexColors[0].clone();
							vcm.lerpSelf(face.vertexColors[1], 0.5);

							triA.vertexColors[1].copy(vcm);
							triB.vertexColors[0].copy(vcm);
						}

						edge = 0;
					} else if (dbc >= dab && dbc >= dac) {
						vm = vb.clone();
						vm.lerpSelf(vc, 0.5);

						triA.a = a;
						triA.b = b;
						triA.c = m;

						triB.a = m;
						triB.b = c;
						triB.c = a;

						if (face.vertexNormals.length === 3) {
							vnm = face.vertexNormals[1].clone();
							vnm.lerpSelf(face.vertexNormals[2], 0.5);

							triA.vertexNormals[2].copy(vnm);

							triB.vertexNormals[0].copy(vnm);
							triB.vertexNormals[1].copy(face.vertexNormals[2]);
							triB.vertexNormals[2].copy(face.vertexNormals[0]);
						}

						if (face.vertexColors.length === 3) {
							vcm = face.vertexColors[1].clone();
							vcm.lerpSelf(face.vertexColors[2], 0.5);

							triA.vertexColors[2].copy(vcm);

							triB.vertexColors[0].copy(vcm);
							triB.vertexColors[1].copy(face.vertexColors[2]);
							triB.vertexColors[2].copy(face.vertexColors[0]);
						}

						edge = 1;
					} else {
						vm = va.clone();
						vm.lerpSelf(vc, 0.5);

						triA.a = a;
						triA.b = b;
						triA.c = m;

						triB.a = m;
						triB.b = b;
						triB.c = c;

						if (face.vertexNormals.length === 3) {
							vnm = face.vertexNormals[0].clone();
							vnm.lerpSelf(face.vertexNormals[2], 0.5);

							triA.vertexNormals[2].copy(vnm);
							triB.vertexNormals[0].copy(vnm);
						}

						if (face.vertexColors.length === 3) {
							vcm = face.vertexColors[0].clone();
							vcm.lerpSelf(face.vertexColors[2], 0.5);

							triA.vertexColors[2].copy(vcm);
							triB.vertexColors[0].copy(vcm);
						}

						edge = 2;
					}

					faces.push(triA, triB);
					geometry.vertices.push(vm);

					var j, jl, uvs, uvA, uvB, uvC, uvM, uvsTriA, uvsTriB;

					for (j = 0, jl = geometry.faceVertexUvs.length; j < jl; j ++) {
						if (geometry.faceVertexUvs[j].length) {
							uvs = geometry.faceVertexUvs[j][i];

							uvA = uvs[0];
							uvB = uvs[1];
							uvC = uvs[2];

							if (edge === 0) {
								uvM = uvA.clone();
								uvM.lerpSelf(uvB, 0.5);

								uvsTriA = [uvA.clone(), uvM.clone(), uvC.clone()];
								uvsTriB = [uvM.clone(), uvB.clone(), uvC.clone()];
							} else if (edge === 1) {
								uvM = uvB.clone();
								uvM.lerpSelf(uvC, 0.5);

								uvsTriA = [uvA.clone(), uvB.clone(), uvM.clone()];
								uvsTriB = [uvM.clone(), uvC.clone(), uvA.clone()];
							} else {
								uvM = uvA.clone();
								uvM.lerpSelf(uvC, 0.5);

								uvsTriA = [uvA.clone(), uvB.clone(), uvM.clone()];
								uvsTriB = [uvM.clone(), uvB.clone(), uvC.clone()];
							}

							faceVertexUvs[j].push(uvsTriA, uvsTriB);
						}
					}
				} else {
					faces.push(face);

					for (j = 0, jl = geometry.faceVertexUvs.length; j < jl; j ++) {
						faceVertexUvs[j].push(geometry.faceVertexUvs[j][i]);
					}
				}
			} else {
				a = face.a;
				b = face.b;
				c = face.c;
				d = face.d;

				va = geometry.vertices[a];
				vb = geometry.vertices[b];
				vc = geometry.vertices[c];
				vd = geometry.vertices[d];

				dab = va.distanceTo(vb);
				dbc = vb.distanceTo(vc);
				dcd = vc.distanceTo(vd);
				dad = va.distanceTo(vd);

				if (dab > maxEdgeLength || dbc > maxEdgeLength || dcd > maxEdgeLength || dad > maxEdgeLength) {
					m1 = geometry.vertices.length;
					m2 = geometry.vertices.length + 1;

					quadA = face.clone();
					quadB = face.clone();

					if ((dab >= dbc && dab >= dcd && dab >= dad) || (dcd >= dbc && dcd >= dab && dcd >= dad)) {
						vm1 = va.clone();
						vm1.lerpSelf(vb, 0.5);

						vm2 = vc.clone();
						vm2.lerpSelf(vd, 0.5);

						quadA.a = a;
						quadA.b = m1;
						quadA.c = m2;
						quadA.d = d;

						quadB.a = m1;
						quadB.b = b;
						quadB.c = c;
						quadB.d = m2;

						if (face.vertexNormals.length === 4) {
							vnm1 = face.vertexNormals[0].clone();
							vnm1.lerpSelf(face.vertexNormals[1], 0.5);

							vnm2 = face.vertexNormals[2].clone();
							vnm2.lerpSelf(face.vertexNormals[3], 0.5);

							quadA.vertexNormals[1].copy(vnm1);
							quadA.vertexNormals[2].copy(vnm2);

							quadB.vertexNormals[0].copy(vnm1);
							quadB.vertexNormals[3].copy(vnm2);
						}

						if (face.vertexColors.length === 4) {
							vcm1 = face.vertexColors[0].clone();
							vcm1.lerpSelf(face.vertexColors[1], 0.5);

							vcm2 = face.vertexColors[2].clone();
							vcm2.lerpSelf(face.vertexColors[3], 0.5);

							quadA.vertexColors[1].copy(vcm1);
							quadA.vertexColors[2].copy(vcm2);

							quadB.vertexColors[0].copy(vcm1);
							quadB.vertexColors[3].copy(vcm2);
						}

						edge = 0;
					} else {
						vm1 = vb.clone();
						vm1.lerpSelf(vc, 0.5);

						vm2 = vd.clone();
						vm2.lerpSelf(va, 0.5);

						quadA.a = a;
						quadA.b = b;
						quadA.c = m1;
						quadA.d = m2;

						quadB.a = m2;
						quadB.b = m1;
						quadB.c = c;
						quadB.d = d;

						if (face.vertexNormals.length === 4) {
							vnm1 = face.vertexNormals[1].clone();
							vnm1.lerpSelf(face.vertexNormals[2], 0.5);

							vnm2 = face.vertexNormals[3].clone();
							vnm2.lerpSelf(face.vertexNormals[0], 0.5);

							quadA.vertexNormals[2].copy(vnm1);
							quadA.vertexNormals[3].copy(vnm2);

							quadB.vertexNormals[0].copy(vnm2);
							quadB.vertexNormals[1].copy(vnm1);
						}

						if (face.vertexColors.length === 4) {
							vcm1 = face.vertexColors[1].clone();
							vcm1.lerpSelf(face.vertexColors[2], 0.5);

							vcm2 = face.vertexColors[3].clone();
							vcm2.lerpSelf(face.vertexColors[0], 0.5);

							quadA.vertexColors[2].copy(vcm1);
							quadA.vertexColors[3].copy(vcm2);

							quadB.vertexColors[0].copy(vcm2);
							quadB.vertexColors[1].copy(vcm1);
						}

						edge = 1;
					}

					faces.push(quadA, quadB);
					geometry.vertices.push(vm1, vm2);

					var j, jl, uvs, uvA, uvB, uvC, uvD, uvM1, uvM2, uvsQuadA, uvsQuadB;

					for (j = 0, jl = geometry.faceVertexUvs.length; j < jl; j ++) {
						if (geometry.faceVertexUvs[j].length) {
							uvs = geometry.faceVertexUvs[j][i];

							uvA = uvs[0];
							uvB = uvs[1];
							uvC = uvs[2];
							uvD = uvs[3];

							if (edge === 0) {
								uvM1 = uvA.clone();
								uvM1.lerpSelf(uvB, 0.5);

								uvM2 = uvC.clone();
								uvM2.lerpSelf(uvD, 0.5);

								uvsQuadA = [uvA.clone(), uvM1.clone(), uvM2.clone(), uvD.clone()];
								uvsQuadB = [uvM1.clone(), uvB.clone(), uvC.clone(), uvM2.clone()];
							} else {
								uvM1 = uvB.clone();
								uvM1.lerpSelf(uvC, 0.5);

								uvM2 = uvD.clone();
								uvM2.lerpSelf(uvA, 0.5);

								uvsQuadA = [uvA.clone(), uvB.clone(), uvM1.clone(), uvM2.clone()];
								uvsQuadB = [uvM2.clone(), uvM1.clone(), uvC.clone(), uvD.clone()];
							}

							faceVertexUvs[j].push(uvsQuadA, uvsQuadB);
						}
					}
				} else {
					faces.push(face);

					for (j = 0, jl = geometry.faceVertexUvs.length; j < jl; j ++) {
						faceVertexUvs[j].push(geometry.faceVertexUvs[j][i]);
					}
				}
			}
		}

		geometry.faces = faces;
		geometry.faceVertexUvs = faceVertexUvs;
	}
};

GeometryUtils.random = Math.random16;

GeometryUtils.__v1 = new Vector3();