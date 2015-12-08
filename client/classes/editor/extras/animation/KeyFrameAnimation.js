KeyFrameAnimation = function(root, data, JITCompile) {
	this.root = root;
	this.data = AnimationHandler.get(data);
	this.hierarchy = AnimationHandler.parse(root);
	this.currentTime = 0;
	this.timeScale = 0.001;
	this.isPlaying = false;
	this.isPaused = true;
	this.loop = true;
	this.JITCompile = JITCompile !== undefined ? JITCompile : true;

	for (var h = 0, hl = this.hierarchy.length; h < hl; h++) {
		var keys = this.data.hierarchy[h].keys,
			sids = this.data.hierarchy[h].sids,
			obj = this.hierarchy[h];

		if (keys.length && sids) {
			for (var s = 0; s < sids.length; s++) {
				var sid = sids[s],
					next = this.getNextKeyWith(sid, h, 0);

				if (next) {
					next.apply(sid);
				}
			}

			obj.matrixAutoUpdate = false;
			this.data.hierarchy[h].node.updateMatrix();
			obj.matrixWorldNeedsUpdate = true;
		}
	}
};

KeyFrameAnimation.prototype.play = function(loop, startTimeMS) {
	if(!this.isPlaying) {
		this.isPlaying = true;
		this.loop = loop !== undefined ? loop : true;
		this.currentTime = startTimeMS !== undefined ? startTimeMS : 0;
		this.startTimeMs = startTimeMS;
		this.startTime = 10000000;
		this.endTime = -this.startTime;

		var h, hl = this.hierarchy.length,
			object,
			node;

		for (h = 0; h < hl; h++) {
			object = this.hierarchy[h];
			node = this.data.hierarchy[h];
			object.useQuaternion = true;

			if (node.animationCache === undefined) {
				node.animationCache = {};
				node.animationCache.prevKey = null;
				node.animationCache.nextKey = null;
				node.animationCache.originalMatrix = object instanceof Bone ? object.skinMatrix : object.matrix;
			}

			var keys = this.data.hierarchy[h].keys;

			if (keys.length) {
				node.animationCache.prevKey = keys[0];
				node.animationCache.nextKey = keys[1];

				this.startTime = Math.min(keys[0].time, this.startTime);
				this.endTime = Math.max(keys[keys.length - 1].time, this.endTime);
			}
		}

		this.update(0);
	}

	this.isPaused = false;

	AnimationHandler.addToUpdate(this);
};

KeyFrameAnimation.prototype.pause = function() {
	if(this.isPaused) {
		AnimationHandler.addToUpdate(this);
	} else {
		AnimationHandler.removeFromUpdate(this);
	}

	this.isPaused = !this.isPaused;
};

KeyFrameAnimation.prototype.stop = function() {
	this.isPlaying = false;
	this.isPaused  = false;
	AnimationHandler.removeFromUpdate(this);

	for (var h = 0; h < this.data.hierarchy.length; h++) {
        
        var obj = this.hierarchy[h];
		var node = this.data.hierarchy[h];

		if (node.animationCache !== undefined) {
			var original = node.animationCache.originalMatrix;

			if(obj instanceof Bone) {
				original.copy(obj.skinMatrix);
				obj.skinMatrix = original;
			} else {
				original.copy(obj.matrix);
				obj.matrix = original;
			}

			delete node.animationCache;
		}
	}
};

KeyFrameAnimation.prototype.update = function(deltaTimeMS) {
	if(!this.isPlaying) return;

	var prevKey, nextKey;
	var object;
	var node;
	var frame;
	var JIThierarchy = this.data.JIT.hierarchy;
	var currentTime, unloopedCurrentTime;
	var looped;

	this.currentTime += deltaTimeMS * this.timeScale;

	unloopedCurrentTime = this.currentTime;
	currentTime         = this.currentTime = this.currentTime % this.data.length;
	if (currentTime < this.startTimeMs) {
		currentTime = this.currentTime = this.startTimeMs + currentTime;
	}

	frame               = parseInt(Math.min(currentTime * this.data.fps, this.data.length * this.data.fps), 10);
	looped 				= currentTime < unloopedCurrentTime;

	if (looped && !this.loop) {
		for (var h = 0, hl = this.hierarchy.length; h < hl; h++) {
			var keys = this.data.hierarchy[h].keys,
				sids = this.data.hierarchy[h].sids,
				end = keys.length-1,
				obj = this.hierarchy[h];

			if (keys.length) {
				for (var s = 0; s < sids.length; s++) {
					var sid = sids[s],
						prev = this.getPrevKeyWith(sid, h, end);

					if (prev) {
						prev.apply(sid);
					}
				}

				this.data.hierarchy[h].node.updateMatrix();
				obj.matrixWorldNeedsUpdate = true;
			}
		}

		this.stop();
		return;
	}
	if (currentTime < this.startTime) {
		return;
	}

	for (var h = 0, hl = this.hierarchy.length; h < hl; h++) {
		object = this.hierarchy[h];
		node = this.data.hierarchy[h];

		var keys = node.keys,
			animationCache = node.animationCache;

		if (this.JITCompile && JIThierarchy[h][frame] !== undefined) {
			if(object instanceof Bone) {
				object.skinMatrix = JIThierarchy[h][frame];
				object.matrixWorldNeedsUpdate = false;
			} else {
				object.matrix = JIThierarchy[h][frame];
				object.matrixWorldNeedsUpdate = true;
			}
		} else if (keys.length) {
			if (this.JITCompile && animationCache) {
				if(object instanceof Bone) {
					object.skinMatrix = animationCache.originalMatrix;
				} else {
					object.matrix = animationCache.originalMatrix;
				}
			}

			prevKey = animationCache.prevKey;
			nextKey = animationCache.nextKey;

			if (prevKey && nextKey) {
				if (nextKey.time <= unloopedCurrentTime) {
					if (looped && this.loop) {
						prevKey = keys[0];
						nextKey = keys[1];

						while (nextKey.time < currentTime) {
							prevKey = nextKey;
							nextKey = keys[prevKey.index + 1];
						}
					} else if (!looped) {
						var lastIndex = keys.length - 1;

						while (nextKey.time < currentTime && nextKey.index !== lastIndex) {
							prevKey = nextKey;
							nextKey = keys[prevKey.index + 1];
						}
					}

					animationCache.prevKey = prevKey;
					animationCache.nextKey = nextKey;
				}
                if(nextKey.time >= currentTime)
                    prevKey.interpolate(nextKey, currentTime);
                else
                    prevKey.interpolate(nextKey, nextKey.time);
			}

			this.data.hierarchy[h].node.updateMatrix();
			object.matrixWorldNeedsUpdate = true;
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

KeyFrameAnimation.prototype.getNextKeyWith = function(sid, h, key) {
	var keys = this.data.hierarchy[h].keys;
	key = key % keys.length;

	for (; key < keys.length; key++) {
		if (keys[key].hasTarget(sid)) {
			return keys[key];
		}
	}

	return keys[0];
};

KeyFrameAnimation.prototype.getPrevKeyWith = function(sid, h, key) {
	var keys = this.data.hierarchy[h].keys;
	key = key >= 0 ? key : key + keys.length;

	for (; key >= 0; key--) {
		if (keys[key].hasTarget(sid)) {
			return keys[key];
		}
	}

	return keys[keys.length - 1];
};