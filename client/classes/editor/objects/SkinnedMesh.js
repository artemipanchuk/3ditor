SkinnedMesh = function (geometry, material) {
	Mesh.call(this, geometry, material);

	this.identityMatrix = new Matrix4();

	this.bones = [];
	this.boneMatrices = [];

	var b, bone, gbone, p, q, s;

	if (this.geometry.bones !== undefined) {
		for (b = 0; b < this.geometry.bones.length; b ++) {
			gbone = this.geometry.bones[b];

			p = gbone.pos;
			q = gbone.rotq;
			s = gbone.scl;

			bone = this.addBone();

			bone.name = gbone.name;
			bone.position.set(p[0], p[1], p[2]);
			bone.quaternion.set(q[0], q[1], q[2], q[3]);
			bone.useQuaternion = true;

			if (s !== undefined) {
				bone.scale.set(s[0], s[1], s[2]);
			} else {
				bone.scale.set(1, 1, 1);
			}
		}

		for (b = 0; b < this.bones.length; b ++) {
			gbone = this.geometry.bones[b];
			bone = this.bones[b];

			if (gbone.parent === -1) {
				this.add(bone);
			} else {
				this.bones[gbone.parent].add(bone);
			}
		}

		this.boneMatrices = new Float32Array(16 * this.bones.length);

		this.pose();
	}
};

SkinnedMesh.prototype = new Mesh();
SkinnedMesh.prototype.constructor = SkinnedMesh;

SkinnedMesh.prototype.addBone = function(bone) {
	if (bone === undefined) {
		bone = new Bone(this);
	}

	this.bones.push(bone);

	return bone;
};

SkinnedMesh.prototype.updateMatrixWorld = function (force) {
	this.matrixAutoUpdate && this.updateMatrix();

	if (this.matrixWorldNeedsUpdate || force) {
		if (this.parent) {
			this.matrixWorld.multiply(this.parent.matrixWorld, this.matrix);
		} else {
			this.matrixWorld.copy(this.matrix);
		}

		this.matrixWorldNeedsUpdate = false;

		force = true;
	}

	for (var i = 0, l = this.children.length; i < l; i ++) {
		var child = this.children[i];

		if (child instanceof Bone) {
			child.update(this.identityMatrix, false);
		} else {
			child.updateMatrixWorld(true);
		}
	}

	var b, bl = this.bones.length,
		ba = this.bones,
		bm = this.boneMatrices;

	for (b = 0; b < bl; b ++) {
		ba[b].skinMatrix.flattenToArrayOffset(bm, b * 16);
	}
};

SkinnedMesh.prototype.pose = function() {
	this.updateMatrixWorld(true);

	var bim, bone, boneInverses = [];

	for (var b = 0; b < this.bones.length; b ++) {
		bone = this.bones[b];

		var inverseMatrix = new Matrix4();
		inverseMatrix.getInverse(bone.skinMatrix);

		boneInverses.push(inverseMatrix);

		bone.skinMatrix.flattenToArrayOffset(this.boneMatrices, b * 16);
	}

	if (this.geometry.skinVerticesA === undefined) {
		this.geometry.skinVerticesA = [];
		this.geometry.skinVerticesB = [];

		var orgVertex, vertex;

		for (var i = 0; i < this.geometry.skinIndices.length; i ++) {
			orgVertex = this.geometry.vertices[i];

			var indexA = this.geometry.skinIndices[i].x;
			var indexB = this.geometry.skinIndices[i].y;

			vertex = new Vector3(orgVertex.x, orgVertex.y, orgVertex.z);
			this.geometry.skinVerticesA.push(boneInverses[indexA].multiplyVector3(vertex));

			vertex = new Vector3(orgVertex.x, orgVertex.y, orgVertex.z);
			this.geometry.skinVerticesB.push(boneInverses[indexB].multiplyVector3(vertex));

			if (this.geometry.skinWeights[i].x + this.geometry.skinWeights[i].y !== 1) {
				var len = (1.0 - (this.geometry.skinWeights[i].x + this.geometry.skinWeights[i].y)) * 0.5;
				this.geometry.skinWeights[i].x += len;
				this.geometry.skinWeights[i].y += len;
			}
		}
	}
};