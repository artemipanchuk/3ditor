SubdivisionModifier = function(subdivisions) {
	this.subdivisions = (subdivisions === undefined) ? 1 : subdivisions;
	this.useOldVertexColors = false;
	this.supportUVs = true;
	this.debug = false;
};

SubdivisionModifier.prototype.constructor = SubdivisionModifier;
SubdivisionModifier.prototype.modify = function (geometry) {
	var repeats = this.subdivisions;

	while (repeats-- > 0) {
		this.smooth(geometry);
	}

};

SubdivisionModifier.prototype.smooth = function (oldGeometry) {
	var newVertices = [], newFaces = [], newUVs = [];
	function v(x, y, z) {
		newVertices.push(new Vector3(x, y, z));
	}
	var scope = this;

	function debug() {
		if (scope.debug) console.log.apply(console, arguments);
	}

	function warn() {
		if (console)
		console.log.apply(console, arguments);
	}

	function f4(a, b, c, d, oldFace, orders, facei) {
		var newFace = new Face4(a, b, c, d, null, oldFace.color, oldFace.material);
		if (scope.useOldVertexColors) {
			newFace.vertexColors = []; 
			var color, tmpColor, order;
			for (var i=0;i<4;i++) {
				order = orders[i];
				color = new Color(),
				color.setRGB(0,0,0);
				for (var j=0, jl=0; j<order.length;j++) {
					tmpColor = oldFace.vertexColors[order[j]-1];
					color.r += tmpColor.r;
					color.g += tmpColor.g;
					color.b += tmpColor.b;
				}
				color.r /= order.length;
				color.g /= order.length;
				color.b /= order.length;
				newFace.vertexColors[i] = color;
			}
		}
		newFaces.push(newFace);

		if (scope.supportUVs) {
			var aUv = [
				getUV(a, ''),
				getUV(b, facei),
				getUV(c, facei),
				getUV(d, facei)
			];
			if (!aUv[0]) debug('a :(', a+':'+facei);
			else if (!aUv[1]) debug('b :(', b+':'+facei);
			else if (!aUv[2]) debug('c :(', c+':'+facei);
			else if (!aUv[3]) debug('d :(', d+':'+facei);
			else 
				newUVs.push(aUv);
		}
	}
	function edge_hash(a, b) {
		return Math.min(a, b) + "_" + Math.max(a, b);
	}
	function computeEdgeFaces(geometry) {
		var i, il, v1, v2, j, k,
			face, faceIndices, faceIndex,
			edge,
			hash,
			edgeFaceMap = {};

		function mapEdgeHash(hash, i) {
			if (edgeFaceMap[hash] === undefined) {
				edgeFaceMap[hash] = [];
			}
			edgeFaceMap[hash].push(i);
		}

		for(i = 0, il = geometry.faces.length; i < il; i ++) {
			face = geometry.faces[i];

			if (face instanceof Face3) {
				hash = edge_hash(face.a, face.b);
				mapEdgeHash(hash, i);

				hash = edge_hash(face.b, face.c);
				mapEdgeHash(hash, i);

				hash = edge_hash(face.c, face.a);
				mapEdgeHash(hash, i);
			} else if (face instanceof Face4) {
				hash = edge_hash(face.a, face.b);
				mapEdgeHash(hash, i);

				hash = edge_hash(face.b, face.c);
				mapEdgeHash(hash, i);

				hash = edge_hash(face.c, face.d);
				mapEdgeHash(hash, i);
				hash = edge_hash(face.d, face.a);
				mapEdgeHash(hash, i);
			}
		}

		return edgeFaceMap;
	}
	var originalPoints = oldGeometry.vertices;
	var originalFaces = oldGeometry.faces;
	var newPoints = originalPoints.concat();
	var facePoints = [], edgePoints = {};
	var sharpEdges = {}, sharpVertices = [], sharpFaces = [];
	var uvForVertices = {};

	var originalVerticesLength = originalPoints.length;

	function getUV(vertexNo, oldFaceNo) {
		var j,jl;

		var key = vertexNo+':'+oldFaceNo;
		var theUV = uvForVertices[key];

		if (!theUV) {
			if (vertexNo>=originalVerticesLength && vertexNo < (originalVerticesLength + originalFaces.length)) {
				debug('face pt');
			} else {
				debug('edge pt');
			}

			warn('warning, UV not found for', key);

			return null;
		}

		return theUV;
	}

	function addUV(vertexNo, oldFaceNo, value) {
		var key = vertexNo+':'+oldFaceNo;
		if (!(key in uvForVertices)) {
			uvForVertices[key] = value;
		} else {
			warn('dup vertexNo', vertexNo, 'oldFaceNo', oldFaceNo, 'value', value, 'key', key, uvForVertices[key]);
		}
	}
	var i, il, j, jl, face;
	var uvs = oldGeometry.faceVertexUvs[0];
	var abcd = 'abcd', vertice;

	debug('originalFaces, uvs, originalVerticesLength', originalFaces.length, uvs.length, originalVerticesLength);
	if (scope.supportUVs)
	for (i=0, il = uvs.length; i<il; i++) {
		for (j=0,jl=uvs[i].length;j<jl;j++) {
			vertice = originalFaces[i][abcd.charAt(j)];
			addUV(vertice, i, uvs[i][j]);
		}
	}

	if (uvs.length == 0) scope.supportUVs = false;
	var uvCount = 0;
	for (var u in uvForVertices) {
		uvCount++;
	}
	if (!uvCount) {
		scope.supportUVs = false;
		debug('no uvs');
	}

	debug('-- Original Faces + Vertices UVs completed', uvForVertices, 'vs', uvs.length);
	var avgUv ;
	for (i=0, il = originalFaces.length; i<il ;i++) {
		face = originalFaces[i];
		facePoints.push(face.centroid);
		newPoints.push(face.centroid);
		if (!scope.supportUVs) continue;
		avgUv = new UV();
		if (face instanceof Face3) {
			avgUv.u = getUV(face.a, i).u + getUV(face.b, i).u + getUV(face.c, i).u;
			avgUv.v = getUV(face.a, i).v + getUV(face.b, i).v + getUV(face.c, i).v;
			avgUv.u /= 3;
			avgUv.v /= 3;
		} else if (face instanceof Face4) {
			avgUv.u = getUV(face.a, i).u + getUV(face.b, i).u + getUV(face.c, i).u + getUV(face.d, i).u;
			avgUv.v = getUV(face.a, i).v + getUV(face.b, i).v + getUV(face.c, i).v + getUV(face.d, i).v;
			avgUv.u /= 4;
			avgUv.v /= 4;
		}

		addUV(originalVerticesLength + i, '', avgUv);
	}

	debug('-- added UVs for new Faces', uvForVertices);
	var edgeFaceMap = computeEdgeFaces (oldGeometry);
	var edge, faceIndexA, faceIndexB, avg;

	var edgeCount = 0;

	var edgeVertex, edgeVertexA, edgeVertexB;
	var vertexEdgeMap = {};
	var vertexFaceMap = {};
	function addVertexEdgeMap(vertex, edge) {
		if (vertexEdgeMap[vertex]===undefined) {
			vertexEdgeMap[vertex] = [];
		}
		vertexEdgeMap[vertex].push(edge);
	}
	function addVertexFaceMap(vertex, face, edge) {
		if (vertexFaceMap[vertex]===undefined) {
			vertexFaceMap[vertex] = {};
		}
		vertexFaceMap[vertex][face] = edge;
	}
	for (i in edgeFaceMap) {
		edge = edgeFaceMap[i];
		edgeVertex = i.split('_');
		edgeVertexA = edgeVertex[0];
		edgeVertexB = edgeVertex[1];
		addVertexEdgeMap(edgeVertexA, [edgeVertexA, edgeVertexB]);
		addVertexEdgeMap(edgeVertexB, [edgeVertexA, edgeVertexB]);
		for (j=0,jl=edge.length;j<jl;j++) {
			face = edge[j];
			addVertexFaceMap(edgeVertexA, face, i);
			addVertexFaceMap(edgeVertexB, face, i);
		}
		if (edge.length < 2) {
			sharpEdges[i] = true;
			sharpVertices[edgeVertexA] = true;
			sharpVertices[edgeVertexB] = true;
		}
	}
	debug('vertexEdgeMap',vertexEdgeMap, 'vertexFaceMap', vertexFaceMap);
	for (i in edgeFaceMap) {
		edge = edgeFaceMap[i];
		faceIndexA = edge[0];
		faceIndexB = edge[1];
		edgeVertex = i.split('_');
		edgeVertexA = edgeVertex[0];
		edgeVertexB = edgeVertex[1];
		avg = new Vector3();
		if (sharpEdges[i]) {
			avg.addSelf(originalPoints[edgeVertexA]);
			avg.addSelf(originalPoints[edgeVertexB]);
			avg.multiplyScalar(0.5);
			sharpVertices[newPoints.length] = true;
		} else {
			avg.addSelf(facePoints[faceIndexA]);
			avg.addSelf(facePoints[faceIndexB]);
			avg.addSelf(originalPoints[edgeVertexA]);
			avg.addSelf(originalPoints[edgeVertexB]);
			avg.multiplyScalar(0.25);
		}
		edgePoints[i] = originalVerticesLength + originalFaces.length + edgeCount;
		newPoints.push(avg);
		edgeCount ++;
		if (!scope.supportUVs) {
			continue;
		}
		avgUv = new UV();
		avgUv.u = getUV(edgeVertexA, faceIndexA).u + getUV(edgeVertexB, faceIndexA).u;
		avgUv.v = getUV(edgeVertexA, faceIndexA).v + getUV(edgeVertexB, faceIndexA).v;
		avgUv.u /= 2;
		avgUv.v /= 2;

		addUV(edgePoints[i], faceIndexA, avgUv);

		if (!sharpEdges[i]) {
		avgUv = new UV();
		avgUv.u = getUV(edgeVertexA, faceIndexB).u + getUV(edgeVertexB, faceIndexB).u;
		avgUv.v = getUV(edgeVertexA, faceIndexB).v + getUV(edgeVertexB, faceIndexB).v;
		avgUv.u /= 2;
		avgUv.v /= 2;
		addUV(edgePoints[i], faceIndexB, avgUv);
		}
	}

	debug('-- Step 2 done');
	var facePt, currentVerticeIndex;
	var hashAB, hashBC, hashCD, hashDA, hashCA;
	var abc123 = ['123', '12', '2', '23'];
	var bca123 = ['123', '23', '3', '31'];
	var cab123 = ['123', '31', '1', '12'];
	var abc1234 = ['1234', '12', '2', '23'];
	var bcd1234 = ['1234', '23', '3', '34'];
	var cda1234 = ['1234', '34', '4', '41'];
	var dab1234 = ['1234', '41', '1', '12'];
	for (i=0, il = facePoints.length; i<il ;i++) {
		facePt = facePoints[i];
		face = originalFaces[i];
		currentVerticeIndex = originalVerticesLength+ i;
		if (face instanceof Face3) {
			hashAB = edge_hash(face.a, face.b);
			hashBC = edge_hash(face.b, face.c);
			hashCA = edge_hash(face.c, face.a);
			f4(currentVerticeIndex, edgePoints[hashAB], face.b, edgePoints[hashBC], face, abc123, i);
			f4(currentVerticeIndex, edgePoints[hashBC], face.c, edgePoints[hashCA], face, bca123, i);
			f4(currentVerticeIndex, edgePoints[hashCA], face.a, edgePoints[hashAB], face, cab123, i);
		} else if (face instanceof Face4) {
			hashAB = edge_hash(face.a, face.b);
			hashBC = edge_hash(face.b, face.c);
			hashCD = edge_hash(face.c, face.d);
			hashDA = edge_hash(face.d, face.a);
			f4(currentVerticeIndex, edgePoints[hashAB], face.b, edgePoints[hashBC], face, abc1234, i);
			f4(currentVerticeIndex, edgePoints[hashBC], face.c, edgePoints[hashCD], face, bcd1234, i);
			f4(currentVerticeIndex, edgePoints[hashCD], face.d, edgePoints[hashDA], face, cda1234, i);
			f4(currentVerticeIndex, edgePoints[hashDA], face.a, edgePoints[hashAB], face, dab1234, i);

		} else {
			debug('face should be a face!', face);
		}
	}
	newVertices = newPoints;

	var F = new Vector3();
	var R = new Vector3();

	var n;
	for (i=0, il = originalPoints.length; i<il; i++) {
		if (vertexEdgeMap[i]===undefined) continue;
		F.set(0,0,0);
		R.set(0,0,0);
		var newPos =  new Vector3(0,0,0);
		var f =0;
		for (j in vertexFaceMap[i]) {
			F.addSelf(facePoints[j]);
			f++;
		}
		var sharpEdgeCount = 0;
		n = vertexEdgeMap[i].length;
		for (j=0;j<n;j++) {
			if (
				sharpEdges[
					edge_hash(vertexEdgeMap[i][j][0],vertexEdgeMap[i][j][1])
				]) {
					sharpEdgeCount++;
				}
		}
		if (sharpEdgeCount==2) {
			continue;
		}

		F.divideScalar(f);
		for (j=0; j<n;j++) {
			edge = vertexEdgeMap[i][j];
			var midPt = originalPoints[edge[0]].clone().addSelf(originalPoints[edge[1]]).divideScalar(2);
			R.addSelf(midPt);
		}
		R.divideScalar(n);
		newPos.addSelf(originalPoints[i]);
		newPos.multiplyScalar(n - 3);
		newPos.addSelf(F);
		newPos.addSelf(R.multiplyScalar(2));
		newPos.divideScalar(n);
		newVertices[i] = newPos;
	}
	var newGeometry = oldGeometry;
	newGeometry.vertices = newVertices;
	newGeometry.faces = newFaces;
	newGeometry.faceVertexUvs[0] = newUVs;
	delete newGeometry.__tmpVertices;
	newGeometry.computeCentroids();
	newGeometry.computeFaceNormals();
	newGeometry.computeVertexNormals();
};