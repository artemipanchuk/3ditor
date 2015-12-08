ArrowHelper = function (dir, origin, length, hex) {
	Object3D.call(this);

	if (hex === undefined) hex = 0xffff00;
	if (length === undefined) length = 20;

	var lineGeometry = new Geometry();
	lineGeometry.vertices.push(new Vector3(0, 0, 0));
	lineGeometry.vertices.push(new Vector3(0, 1, 0));

	this.line = new Line(lineGeometry, new LineBasicMaterial({ color: hex }));
	this.add(this.line);

	var coneGeometry = new CylinderGeometry(0, 0.05, 0.25, 5, 1);

	this.cone = new Mesh(coneGeometry, new MeshBasicMaterial({ color: hex }));
	this.cone.position.set(0, 1, 0);
	this.add(this.cone);

	if (origin instanceof Vector3) this.position = origin;

	this.setDirection(dir);
	this.setLength(length);
};

ArrowHelper.prototype = new Object3D();
ArrowHelper.prototype.constructor = ArrowHelper;

ArrowHelper.prototype.setDirection = function (dir) {
	var axis = new Vector3(0, 1, 0).crossSelf(dir);

	var radians = Math.acos(new Vector3(0, 1, 0).dot(dir.clone().normalize()));

	this.matrix = new Matrix4().makeRotationAxis(axis.normalize(), radians);

	this.rotation.getRotationFromMatrix(this.matrix, this.scale);
};

ArrowHelper.prototype.setLength = function (length) {
	this.scale.set(length, length, length);
};

ArrowHelper.prototype.setColor = function (hex) {
	this.line.material.color.setHex(hex);
	this.cone.material.color.setHex(hex);
};