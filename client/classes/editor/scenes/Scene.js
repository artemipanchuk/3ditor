Scene = function () {
	Object3D.call(this);

	this.fog = null;
	this.overrideMaterial = null;

	this.matrixAutoUpdate = false;

	this.__objects = [];
	this.__lights = [];

	this.__objectsAdded = [];
	this.__objectsRemoved = [];
};

Scene.prototype = new Object3D();
Scene.prototype.constructor = Scene;

Scene.prototype.__addObject = function (object) {
	if (object instanceof Light) {
		if (this.__lights.indexOf(object) === - 1) {
			this.__lights.push(object);
		}
	} else if (!(object instanceof Camera || object instanceof Bone)) {
		if (this.__objects.indexOf(object) === - 1) {
			this.__objects.push(object);
			this.__objectsAdded.push(object);

			var i = this.__objectsRemoved.indexOf(object);

			if (i !== -1) {
				this.__objectsRemoved.splice(i, 1);
			}
		}
	}

	for (var c = 0; c < object.children.length; c ++) {
		this.__addObject(object.children[c]);
	}
};

Scene.prototype.__removeObject = function (object) {
	if (object instanceof Light) {
		var i = this.__lights.indexOf(object);

		if (i !== -1) {
			this.__lights.splice(i, 1);
		}
	} else if (!(object instanceof Camera)) {
		var i = this.__objects.indexOf(object);

		if(i !== -1) {
			this.__objects.splice(i, 1);
			this.__objectsRemoved.push(object);

			var ai = this.__objectsAdded.indexOf(object);

			if (ai !== -1) {
				this.__objectsAdded.splice(ai, 1);
			}
		}
	}

	for (var c = 0; c < object.children.length; c ++) {
		this.__removeObject(object.children[c]);
	}
};