Line = function (geometry, material, type) {
	Object3D.call(this);

	this.geometry = geometry;
	this.material = (material !== undefined) ? material : new LineBasicMaterial({ color: Math.random() * 0xffffff });
	this.type = (type !== undefined) ? type : LineStrip;

	if (this.geometry) {
		if (! this.geometry.boundingSphere) {
			this.geometry.computeBoundingSphere();
		}
	}
};

LineStrip = 0;
LinePieces = 1;

Line.prototype = new Object3D();
Line.prototype.constructor = Line;