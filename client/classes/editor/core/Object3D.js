define([
	"classes/editor/core/Channels",
	"classes/editor/core/EventDispatcher",
	"classes/editor/structures/Vector3",
	"classes/editor/structures/Euler",
	"classes/editor/structures/Quaternion",
	"classes/editor/structures/Matrix3",
	"classes/editor/structures/Matrix4"
], function() {
	this.Object3D = (function() {
		function Object3D() {
			Object.defineProperty(this, 'id', {
				value: Object3DIdCount++
			});

			this.uuid = Math.generateUUID();

			this.name = '';
			this.type = 'Object3D';

			this.parent   = null;
			this.channels = new Channels();
			this.children = [];

			this.up = Object3D.DefaultUp.clone();

			var position   = new Vector3(),
				rotation   = new Euler(),
				quaternion = new Quaternion(),
				scale      = new Vector3(1, 1, 1);

			function onRotationChange() {
				quaternion.setFromEuler(rotation, false);
			}

			function onQuaternionChange() {
				rotation.setFromQuaternion(quaternion, undefined, false);
			}

			rotation.onChange(onRotationChange);
			quaternion.onChange(onQuaternionChange);

			Object.defineProperties(this, {
				position: {
					enumerable: true,
					value:      position
				},
				rotation: {
					enumerable: true,
					value:      rotation
				},
				quaternion: {
					enumerable: true,
					value:      quaternion
				},
				scale: {
					enumerable: true,
					value:      scale
				},
				modelViewMatrix: {
					value: new Matrix4()
				},
				normalMatrix: {
					value: new Matrix3()
				}
			});

			this.rotationAutoUpdate = true;

			this.matrix      = new Matrix4();
			this.matrixWorld = new Matrix4();

			this.matrixAutoUpdate       = Object3D.DefaultMatrixAutoUpdate;
			this.matrixWorldNeedsUpdate = false;

			this.visible = true;

			this.castShadow    = false;
			this.receiveShadow = false;

			this.frustumCulled = true;
			this.renderOrder = 0;

			this.userData = {};
		};

		Object3D.DefaultUp = new Vector3(0, 1, 0);
		Object3D.DefaultMatrixAutoUpdate = true;

		Object3D.prototype = {
			constructor: Object3D,

			get eulerOrder() {
				console.warn('Object3D: .eulerOrder is now .rotation.order.');

				return this.rotation.order;
			},

			set eulerOrder(value) {
				console.warn('Object3D: .eulerOrder is now .rotation.order.');

				this.rotation.order = value;
			},

			get useQuaternion() {
				console.warn('Object3D: .useQuaternion has been removed. The library now uses quaternions by default.');
			},

			set useQuaternion(value) {
				console.warn('Object3D: .useQuaternion has been removed. The library now uses quaternions by default.');
			},

			set renderDepth(value) {
				console.warn('Object3D: .renderDepth has been removed. Use .renderOrder, instead.');
			},

			applyMatrix: function(matrix) {
				this.matrix.multiplyMatrices(matrix, this.matrix);

				this.matrix.decompose(this.position, this.quaternion, this.scale);
			},

			setRotationFromAxisAngle: function(axis, angle) {
				this.quaternion.setFromAxisAngle(axis, angle);
			},

			setRotationFromEuler: function(euler) {
				this.quaternion.setFromEuler(euler, true);
			},

			setRotationFromMatrix: function(m) {
				this.quaternion.setFromRotationMatrix(m);
			},

			setRotationFromQuaternion: function(q) {
				this.quaternion.copy(q);
			},

			rotateOnAxis: (function() {
				var q1 = new Quaternion();

				return function(axis, angle) {
					q1.setFromAxisAngle(axis, angle);

					this.quaternion.multiply(q1);

					return this;
				};
			})(),

			rotateX: (function() {
				var v1 = new Vector3(1, 0, 0);

				return function(angle) {
					return this.rotateOnAxis(v1, angle);
				};
			})(),

			rotateY: (function() {
				var v1 = new Vector3(0, 1, 0);

				return function(angle) {
					return this.rotateOnAxis(v1, angle);
				};
			})(),

			rotateZ: (function() {
				var v1 = new Vector3(0, 0, 1);

				return function(angle) {
					return this.rotateOnAxis(v1, angle);
				};
			})(),

			translateOnAxis: (function() {
				var v1 = new Vector3();

				return function(axis, distance) {

					v1.copy(axis).applyQuaternion(this.quaternion);

					this.position.add(v1.multiplyScalar(distance));

					return this;
				};
			})(),

			translate: function(distance, axis) {
				console.warn('Object3D: .translate() has been removed. Use .translateOnAxis(axis, distance) instead.');
				return this.translateOnAxis(axis, distance);
			},

			translateX: (function() {
				var v1 = new Vector3(1, 0, 0);

				return function(distance) {
					return this.translateOnAxis(v1, distance);
				};
			})(),

			translateY: (function() {
				var v1 = new Vector3(0, 1, 0);

				return function(distance) {
					return this.translateOnAxis(v1, distance);
				};
			})(),

			translateZ: (function() {
				var v1 = new Vector3(0, 0, 1);

				return function(distance) {
					return this.translateOnAxis(v1, distance);
				};
			})(),

			localToWorld: function(vector) {
				return vector.applyMatrix4(this.matrixWorld);
			},

			worldToLocal: (function() {
				var m1 = new Matrix4();

				return function(vector) {
					return vector.applyMatrix4(m1.getInverse(this.matrixWorld));
				};
			})(),

			lookAt: (function() {
				var m1 = new Matrix4();

				return function(vector) {
					m1.lookAt(vector, this.position, this.up);

					this.quaternion.setFromRotationMatrix(m1);
				};
			})(),

			add: function(object) {
				if (arguments.length > 1) {
					for (var i = 0; i < arguments.length; i++) {
						this.add(arguments[i]);
					}

					return this;
				}

				if (object === this) {
					console.error("Object3D.add: object can't be added as a child of itself.", object);
					return this;
				}

				if (object instanceof Object3D) {
					if (object.parent !== null) {
						object.parent.remove(object);
					}

					object.parent = this;
					object.dispatchEvent({ type: 'added' });

					this.children.push(object);
				} else {
					console.error("Object3D.add: object not an instance of Object3D.", object);
				}

				return this;
			},

			remove: function(object) {
				if (arguments.length > 1) {
					for (var i = 0; i < arguments.length; ++i) {
						this.remove(arguments[i]);
					}
				}

				var index = this.children.indexOf(object);

				if (index !== - 1) {
					object.parent = null;

					object.dispatchEvent({ type: 'removed' });

					this.children.splice(index, 1);
				}
			},

			getChildByName: function(name) {
				console.warn('Object3D: .getChildByName() has been renamed to .getObjectByName().');
				return this.getObjectByName(name);
			},

			getObjectById: function(id) {
				return this.getObjectByProperty('id', id);
			},

			getObjectByName: function(name) {
				return this.getObjectByProperty('name', name);
			},

			getObjectByProperty: function(name, value) {
				if (this[name] === value)
					return this;

				for (var i = 0, l = this.children.length; i < l; ++i) {
					var child = this.children[i];
					var object = child.getObjectByProperty(name, value);

					if (object !== undefined) {
						return object;
					}
				}

				return undefined;
			},

			getWorldPosition: function(optionalTarget) {
				var result = optionalTarget || new Vector3();

				this.updateMatrixWorld(true);

				return result.setFromMatrixPosition(this.matrixWorld);
			},

			getWorldQuaternion: (function() {
				var position = new Vector3();
				var scale = new Vector3();

				return function(optionalTarget) {
					var result = optionalTarget || new Quaternion();

					this.updateMatrixWorld(true);

					this.matrixWorld.decompose(position, result, scale);

					return result;
				};
			})(),

			getWorldRotation: (function() {
				var quaternion = new Quaternion();

				return function(optionalTarget) {
					var result = optionalTarget || new Euler();

					this.getWorldQuaternion(quaternion);

					return result.setFromQuaternion(quaternion, this.rotation.order, false);
				};
			})(),

			getWorldScale: (function() {
				var position = new Vector3();
				var quaternion = new Quaternion();

				return function(optionalTarget) {
					var result = optionalTarget || new Vector3();

					this.updateMatrixWorld(true);

					this.matrixWorld.decompose(position, quaternion, result);

					return result;
				};
			})(),

			getWorldDirection: (function() {
				var quaternion = new Quaternion();

				return function(optionalTarget) {
					var result = optionalTarget || new Vector3();

					this.getWorldQuaternion(quaternion);

					return result.set(0, 0, 1).applyQuaternion(quaternion);
				};
			})(),

			raycast: function() {},

			traverse: function(callback) {
				callback(this);

				var children = this.children;

				for (var i = 0, l = children.length; i < l; ++i) {
					children[i].traverse(callback);
				}
			},

			traverseVisible: function(callback) {
				if (this.visible === false) return;

				callback(this);

				var children = this.children;

				for (var i = 0, l = children.length; i < l; ++i) {
					children[i].traverseVisible(callback);
				}
			},

			traverseAncestors: function(callback) {
				var parent = this.parent;

				if (parent !== null) {
					callback(parent);

					parent.traverseAncestors(callback);
				}
			},

			updateMatrix: function() {
				this.matrix.compose(this.position, this.quaternion, this.scale);

				this.matrixWorldNeedsUpdate = true;
			},

			updateMatrixWorld: function(force) {
				if (this.matrixAutoUpdate === true)
					this.updateMatrix();

				if (this.matrixWorldNeedsUpdate === true || force === true) {
					if (this.parent === null) {
						this.matrixWorld.copy(this.matrix);
					} else {
						this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
					}

					this.matrixWorldNeedsUpdate = false;

					force = true;
				}

				for (var i = 0, l = this.children.length; i < l; ++i) {
					this.children[i].updateMatrixWorld(force);
				}
			},

			toJSON: function(meta) {
				function extractFromCache (cache) {
					var values = [];
					for (var key in cache) {
						var data = cache[key];
						delete data.metadata;
						values.push(data);
					}

					return values;
				}

				var isRootObject = (meta === undefined);

				var output = {};

				if (isRootObject) {
					meta = {
						geometries: {},
						materials: {},
						textures: {},
						images: {}
					};

					output.metadata = {
						version: 4.4,
						type: 'Object',
						generator: 'Object3D.toJSON'
					};
				}

				var object = {};

				object.uuid = this.uuid;
				object.type = this.type;

				if (this.name !== '')
					object.name = this.name;

				if (JSON.stringify(this.userData) !== '{}')
					object.userData = this.userData;

				if (this.castShadow === true)
					object.castShadow = true;

				if (this.receiveShadow === true)
					object.receiveShadow = true;

				if (this.visible === false)
					object.visible = false;

				object.matrix = this.matrix.toArray();

				if (this.geometry !== undefined) {
					if (meta.geometries[this.geometry.uuid] === undefined) {
						meta.geometries[this.geometry.uuid] = this.geometry.toJSON(meta);
					}

					object.geometry = this.geometry.uuid;
				}

				if (this.material !== undefined) {
					if (meta.materials[this.material.uuid] === undefined) {
						meta.materials[this.material.uuid] = this.material.toJSON(meta);
					}

					object.material = this.material.uuid;
				}

				if (this.children.length > 0) {
					object.children = [];

					for (var i = 0; i < this.children.length; ++i) {
						object.children.push(this.children[i].toJSON(meta).object);
					}
				}

				if (isRootObject) {
					var geometries = extractFromCache(meta.geometries);
					var materials = extractFromCache(meta.materials);
					var textures = extractFromCache(meta.textures);
					var images = extractFromCache(meta.images);

					if (geometries.length > 0) output.geometries = geometries;
					if (materials.length > 0) output.materials = materials;
					if (textures.length > 0) output.textures = textures;
					if (images.length > 0) output.images = images;
				}

				output.object = object;

				return output;
			},

			clone: function(recursive) {
				return new this.constructor().copy(this, recursive);
			},

			copy: function(source, recursive) {
				if (recursive === undefined)
					recursive = true;

				this.name = source.name;

				this.up.copy(source.up);

				this.position.copy(source.position);
				this.quaternion.copy(source.quaternion);
				this.scale.copy(source.scale);

				this.rotationAutoUpdate = source.rotationAutoUpdate;

				this.matrix.copy(source.matrix);
				this.matrixWorld.copy(source.matrixWorld);

				this.matrixAutoUpdate = source.matrixAutoUpdate;
				this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;

				this.visible = source.visible;

				this.castShadow = source.castShadow;
				this.receiveShadow = source.receiveShadow;

				this.frustumCulled = source.frustumCulled;
				this.renderOrder = source.renderOrder;

				this.userData = JSON.parse(JSON.stringify(source.userData));

				if (recursive === true) {
					for (var i = 0; i < source.children.length; ++i) {
						var child = source.children[i];
						this.add(child.clone());
					}
				}

				return this;
			}
		};

		EventDispatcher.prototype.apply(Object3D.prototype);

		Object3DIdCount = 0;

		return Object3D;
	})();
});