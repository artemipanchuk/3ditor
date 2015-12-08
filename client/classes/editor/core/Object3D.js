Object3D = function () {
	this.id = Object3DCount ++;

	this.name = '';

	this.parent = undefined;
	this.children = [];

	this.up = new Vector3(0, 1, 0);

	this.position = new Vector3();
	this.rotation = new Vector3();
	this.eulerOrder = 'XYZ';
	this.scale = new Vector3(1, 1, 1);

	this.doubleSided = false;
	this.flipSided = false;

	this.renderDepth = null;

	this.rotationAutoUpdate = true;

	this.matrix = new Matrix4();
	this.matrixWorld = new Matrix4();
	this.matrixRotationWorld = new Matrix4();

	this.matrixAutoUpdate = true;
	this.matrixWorldNeedsUpdate = true;

	this.quaternion = new Quaternion();
	this.useQuaternion = false;

	this.boundRadius = 0.0;
	this.boundRadiusScale = 1.0;

	this.visible = true;

	this.castShadow = false;
	this.receiveShadow = false;

	this.frustumCulled = true;

	this._vector = new Vector3();
};

Object3D.prototype = {
	constructor: Object3D,

	applyMatrix: function (matrix) {
		this.matrix.multiply(matrix, this.matrix);

		this.scale.getScaleFromMatrix(this.matrix);
		this.rotation.getRotationFromMatrix(this.matrix, this.scale);
		this.position.getPositionFromMatrix(this.matrix);
	},

	translate: function (distance, axis) {
		this.matrix.rotateAxis(axis);
		this.position.addSelf(axis.multiplyScalar(distance));
	},

	translateX: function (distance) {
		this.translate(distance, this._vector.set(1, 0, 0));
	},

	translateY: function (distance) {
		this.translate(distance, this._vector.set(0, 1, 0));
	},

	translateZ: function (distance) {
		this.translate(distance, this._vector.set(0, 0, 1));
	},

	lookAt: function (vector) {
		this.matrix.lookAt(vector, this.position, this.up);

		if (this.rotationAutoUpdate) {
			this.rotation.getRotationFromMatrix(this.matrix);
		}
	},

	add: function (object) {
		if (object === this) {
			console.warn('Object3D.add: An object can\'t be added as a child of itself.');
			return;
		}

		if (object instanceof Object3D) {
			if (object.parent !== undefined) {
				object.parent.remove(object);
			}

			object.parent = this;
			this.children.push(object);

			var scene = this;

			while (scene.parent !== undefined) {
				scene = scene.parent;
			}

			if (scene !== undefined && scene instanceof Scene)  {
				scene.__addObject(object);
			}
		}
	},

	remove: function (object) {
		var index = this.children.indexOf(object);

		if (index !== - 1) {
			object.parent = undefined;
			this.children.splice(index, 1);

			var scene = this;

			while (scene.parent !== undefined) {
				scene = scene.parent;
			}

			if (scene !== undefined && scene instanceof Scene) {
				scene.__removeObject(object);
			}
		}
	},

	getChildByName: function (name, recursive) {
		var c, cl, child;

		for (c = 0, cl = this.children.length; c < cl; c ++) {
			child = this.children[c];

			if (child.name === name) {
				return child;
			}

			if (recursive) {
				child = child.getChildByName(name, recursive);

				if (child !== undefined) {
					return child;
				}
			}
		}

		return undefined;
	},

	updateMatrix: function () {
		this.matrix.setPosition(this.position);

		if (this.useQuaternion)  {
			this.matrix.setRotationFromQuaternion(this.quaternion);
		} else {
			this.matrix.setRotationFromEuler(this.rotation, this.eulerOrder);
		}

		if (this.scale.x !== 1 || this.scale.y !== 1 || this.scale.z !== 1) {
			this.matrix.scale(this.scale);
			this.boundRadiusScale = Math.max(this.scale.x, Math.max(this.scale.y, this.scale.z));
		}

		this.matrixWorldNeedsUpdate = true;
	},

	updateMatrixWorld: function (force) {
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
			this.children[i].updateMatrixWorld(force);
		}
	}
};

Object3DCount = 0;