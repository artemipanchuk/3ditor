Animation = function(root, data, interpolationType, JITCompile) {
	this.root = root;
	this.data = AnimationHandler.get(data);
	this.hierarchy = AnimationHandler.parse(root);
	this.currentTime = 0;
	this.timeScale = 1;
	this.isPlaying = false;
	this.isPaused = true;
	this.loop = true;
	this.interpolationType = interpolationType !== undefined ? interpolationType : AnimationHandler.LINEAR;
	this.JITCompile = JITCompile !== undefined ? JITCompile : true;

	this.points = [];
	this.target = new Vector3();
};

Animation.prototype.play = function(loop, startTimeMS) {
	if(!this.isPlaying) {
		this.isPlaying = true;
		this.loop = loop !== undefined ? loop : true;
		this.currentTime = startTimeMS !== undefined ? startTimeMS : 0;

		var h, hl = this.hierarchy.length,
			object;

		for (h = 0; h < hl; h++) {
			object = this.hierarchy[h];

			if (this.interpolationType !== AnimationHandler.CATMULLROM_FORWARD) {
				object.useQuaternion = true;
			}

			object.matrixAutoUpdate = true;

			if (object.animationCache === undefined) {
				object.animationCache = {};
				object.animationCache.prevKey = { pos: 0, rot: 0, scl: 0 };
				object.animationCache.nextKey = { pos: 0, rot: 0, scl: 0 };
				object.animationCache.originalMatrix = object instanceof Bone ? object.skinMatrix : object.matrix;
			}

			var prevKey = object.animationCache.prevKey;
			var nextKey = object.animationCache.nextKey;

			prevKey.pos = this.data.hierarchy[h].keys[0];
			prevKey.rot = this.data.hierarchy[h].keys[0];
			prevKey.scl = this.data.hierarchy[h].keys[0];

			nextKey.pos = this.getNextKeyWith("pos", h, 1);
			nextKey.rot = this.getNextKeyWith("rot", h, 1);
			nextKey.scl = this.getNextKeyWith("scl", h, 1);
		}

		this.update(0);
	}

	this.isPaused = false;

	AnimationHandler.addToUpdate(this);
};

Animation.prototype.pause = function() {
	if(this.isPaused) {
		AnimationHandler.addToUpdate(this);
	} else {
		AnimationHandler.removeFromUpdate(this);
	}

	this.isPaused = !this.isPaused;
};

Animation.prototype.stop = function() {
	this.isPlaying = false;
	this.isPaused  = false;
	AnimationHandler.removeFromUpdate(this);

	for (var h = 0; h < this.hierarchy.length; h++) {
		if (this.hierarchy[h].animationCache !== undefined) {
			if(this.hierarchy[h] instanceof Bone) {
				this.hierarchy[h].skinMatrix = this.hierarchy[h].animationCache.originalMatrix;
			} else {
				this.hierarchy[h].matrix = this.hierarchy[h].animationCache.originalMatrix;
			}

			delete this.hierarchy[h].animationCache;
		}
	}
};

Animation.prototype.update = function(deltaTimeMS) {
	if(!this.isPlaying) return;

	var types = ["pos", "rot", "scl"];
	var type;
	var scale;
	var vector;
	var prevXYZ, nextXYZ;
	var prevKey, nextKey;
	var object;
	var animationCache;
	var frame;
	var JIThierarchy = this.data.JIT.hierarchy;
	var currentTime, unloopedCurrentTime;
	var currentPoint, forwardPoint, angle;

	this.currentTime += deltaTimeMS * this.timeScale;

	unloopedCurrentTime = this.currentTime;
	currentTime         = this.currentTime = this.currentTime % this.data.length;
	frame               = parseInt(Math.min(currentTime * this.data.fps, this.data.length * this.data.fps), 10);

	for (var h = 0, hl = this.hierarchy.length; h < hl; h++) {
		object = this.hierarchy[h];
		animationCache = object.animationCache;

		if (this.JITCompile && JIThierarchy[h][frame] !== undefined) {
			if(object instanceof Bone) {
				object.skinMatrix = JIThierarchy[h][frame];

				object.matrixAutoUpdate = false;
				object.matrixWorldNeedsUpdate = false;
			} else {
				object.matrix = JIThierarchy[h][frame];

				object.matrixAutoUpdate = false;
				object.matrixWorldNeedsUpdate = true;
			}
		} else {
			if (this.JITCompile) {
				if(object instanceof Bone) {
					object.skinMatrix = object.animationCache.originalMatrix;
				} else {
					object.matrix = object.animationCache.originalMatrix;
				}
			}

			for (var t = 0; t < 3; t++) {
				type    = types[t];
				prevKey = animationCache.prevKey[type];
				nextKey = animationCache.nextKey[type];

				if (nextKey.time <= unloopedCurrentTime) {
					if (currentTime < unloopedCurrentTime) {
						if (this.loop) {
							prevKey = this.data.hierarchy[h].keys[0];
							nextKey = this.getNextKeyWith(type, h, 1);

							while(nextKey.time < currentTime) {
								prevKey = nextKey;
								nextKey = this.getNextKeyWith(type, h, nextKey.index + 1);
							}
						} else {
							this.stop();
							return;
						}
					} else {
						do {
							prevKey = nextKey;
							nextKey = this.getNextKeyWith(type, h, nextKey.index + 1);
						} while(nextKey.time < currentTime)
					}

					animationCache.prevKey[type] = prevKey;
					animationCache.nextKey[type] = nextKey;
				}

				object.matrixAutoUpdate = true;
				object.matrixWorldNeedsUpdate = true;

				scale = (currentTime - prevKey.time) / (nextKey.time - prevKey.time);
				prevXYZ = prevKey[type];
				nextXYZ = nextKey[type];

				if (scale < 0 || scale > 1) {
					console.log("Animation.update: Warning! Scale out of bounds:" + scale + " on bone " + h);
					scale = scale < 0 ? 0 : 1;
				}

				if (type === "pos") {
					vector = object.position;

					if(this.interpolationType === AnimationHandler.LINEAR) {
						vector.x = prevXYZ[0] + (nextXYZ[0] - prevXYZ[0]) * scale;
						vector.y = prevXYZ[1] + (nextXYZ[1] - prevXYZ[1]) * scale;
						vector.z = prevXYZ[2] + (nextXYZ[2] - prevXYZ[2]) * scale;
					} else if (this.interpolationType === AnimationHandler.CATMULLROM ||
							    this.interpolationType === AnimationHandler.CATMULLROM_FORWARD) {
						this.points[0] = this.getPrevKeyWith("pos", h, prevKey.index - 1)["pos"];
						this.points[1] = prevXYZ;
						this.points[2] = nextXYZ;
						this.points[3] = this.getNextKeyWith("pos", h, nextKey.index + 1)["pos"];

						scale = scale * 0.33 + 0.33;

						currentPoint = this.interpolateCatmullRom(this.points, scale);

						vector.x = currentPoint[0];
						vector.y = currentPoint[1];
						vector.z = currentPoint[2];

						if(this.interpolationType === AnimationHandler.CATMULLROM_FORWARD) {
							forwardPoint = this.interpolateCatmullRom(this.points, scale * 1.01);

							this.target.set(forwardPoint[0], forwardPoint[1], forwardPoint[2]);
							this.target.subSelf(vector);
							this.target.y = 0;
							this.target.normalize();

							angle = Math.atan2(this.target.x, this.target.z);
							object.rotation.set(0, angle, 0);
						}
					}
				} else if (type === "rot") {
					Quaternion.slerp(prevXYZ, nextXYZ, object.quaternion, scale);
				} else if(type === "scl") {
					vector = object.scale;

					vector.x = prevXYZ[0] + (nextXYZ[0] - prevXYZ[0]) * scale;
					vector.y = prevXYZ[1] + (nextXYZ[1] - prevXYZ[1]) * scale;
					vector.z = prevXYZ[2] + (nextXYZ[2] - prevXYZ[2]) * scale;
				}
			}
		}
	}

	if (this.JITCompile) {
		if (JIThierarchy[0][frame] === undefined) {
			this.hierarchy[0].updateMatrixWorld(true);

			for (var h = 0; h < this.hierarchy.length; h++) {
				if(this.hierarchy[h] instanceof Bone) {
					JIThierarchy[h][frame] = this.hierarchy[h].skinMatrix.clone();
				} else {
					JIThierarchy[h][frame] = this.hierarchy[h].matrix.clone();
				}
			}
		}
	}
};

Animation.prototype.interpolateCatmullRom = function (points, scale) {
	var c = [], v3 = [],
	point, intPoint, weight, w2, w3,
	pa, pb, pc, pd;

	point = (points.length - 1) * scale;
	intPoint = Math.floor(point);
	weight = point - intPoint;

	c[0] = intPoint === 0 ? intPoint : intPoint - 1;
	c[1] = intPoint;
	c[2] = intPoint > points.length - 2 ? intPoint : intPoint + 1;
	c[3] = intPoint > points.length - 3 ? intPoint : intPoint + 2;

	pa = points[c[0]];
	pb = points[c[1]];
	pc = points[c[2]];
	pd = points[c[3]];

	w2 = weight * weight;
	w3 = weight * w2;

	v3[0] = this.interpolate(pa[0], pb[0], pc[0], pd[0], weight, w2, w3);
	v3[1] = this.interpolate(pa[1], pb[1], pc[1], pd[1], weight, w2, w3);
	v3[2] = this.interpolate(pa[2], pb[2], pc[2], pd[2], weight, w2, w3);

	return v3;
};

Animation.prototype.interpolate = function(p0, p1, p2, p3, t, t2, t3) {
	var v0 = (p2 - p0) * 0.5,
		v1 = (p3 - p1) * 0.5;

	return (2 * (p1 - p2) + v0 + v1) * t3 + (- 3 * (p1 - p2) - 2 * v0 - v1) * t2 + v0 * t + p1;
};

Animation.prototype.getNextKeyWith = function(type, h, key) {
	var keys = this.data.hierarchy[h].keys;

	if (this.interpolationType === AnimationHandler.CATMULLROM ||
		 this.interpolationType === AnimationHandler.CATMULLROM_FORWARD) {
		key = key < keys.length - 1 ? key : keys.length - 1;
	} else {
		key = key % keys.length;
	}

	for (; key < keys.length; key++) {
		if (keys[key][type] !== undefined) {
			return keys[key];
		}
	}

	return this.data.hierarchy[h].keys[0];
};

Animation.prototype.getPrevKeyWith = function(type, h, key) {
	var keys = this.data.hierarchy[h].keys;

	if (this.interpolationType === AnimationHandler.CATMULLROM ||
		 this.interpolationType === AnimationHandler.CATMULLROM_FORWARD) {
		key = key > 0 ? key : 0;
	} else {
		key = key >= 0 ? key : key + keys.length;
	}

	for (; key >= 0; key--) {
		if (keys[key][type] !== undefined) {
			return keys[key];
		}
	}

	return this.data.hierarchy[h].keys[keys.length - 1];
};