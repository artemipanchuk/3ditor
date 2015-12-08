LOD = function () {
	Object3D.call(this);

	this.LODs = [];
};

LOD.prototype = new Object3D();
LOD.prototype.constructor = LOD;
LOD.prototype.supr = Object3D.prototype;

LOD.prototype.addLevel = function (object3D, visibleAtDistance) {
	if (visibleAtDistance === undefined) {
		visibleAtDistance = 0;
	}

	visibleAtDistance = Math.abs(visibleAtDistance);

	for (var l = 0; l < this.LODs.length; l ++) {
		if (visibleAtDistance < this.LODs[l].visibleAtDistance) {
			break;
		}
	}

	this.LODs.splice(l, 0, { visibleAtDistance: visibleAtDistance, object3D: object3D });
	this.add(object3D);
};

LOD.prototype.update = function (camera) {
	if (this.LODs.length > 1) {
		camera.matrixWorldInverse.getInverse(camera.matrixWorld);

		var inverse  = camera.matrixWorldInverse;
		var distance = -(inverse.elements[2] * this.matrixWorld.elements[12] + inverse.elements[6] * this.matrixWorld.elements[13] + inverse.elements[10] * this.matrixWorld.elements[14] + inverse.elements[14]);

		this.LODs[0].object3D.visible = true;

		for (var l = 1; l < this.LODs.length; l ++) {
			if(distance >= this.LODs[l].visibleAtDistance) {
				this.LODs[l - 1].object3D.visible = false;
				this.LODs[l    ].object3D.visible = true;
			} else {
				break;
			}
		}

		for(; l < this.LODs.length; l ++) {
			this.LODs[l].object3D.visible = false;
		}
	}
};