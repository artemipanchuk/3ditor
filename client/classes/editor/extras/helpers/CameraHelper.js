CameraHelper = function (camera) {
	Object3D.call(this);

	var _this = this;

	this.lineGeometry = new Geometry();
	this.lineMaterial = new LineBasicMaterial({ color: 0xffffff, vertexColors: FaceColors });

	this.pointMap = {};

	var hexFrustum = 0xffaa00,
	hexCone	   	   = 0xff0000,
	hexUp	   	   = 0x00aaff,
	hexTarget  	   = 0xffffff,
	hexCross   	   = 0x333333;

	addLine("n1", "n2", hexFrustum);
	addLine("n2", "n4", hexFrustum);
	addLine("n4", "n3", hexFrustum);
	addLine("n3", "n1", hexFrustum);

	addLine("f1", "f2", hexFrustum);
	addLine("f2", "f4", hexFrustum);
	addLine("f4", "f3", hexFrustum);
	addLine("f3", "f1", hexFrustum);

	addLine("n1", "f1", hexFrustum);
	addLine("n2", "f2", hexFrustum);
	addLine("n3", "f3", hexFrustum);
	addLine("n4", "f4", hexFrustum);

	addLine("p", "n1", hexCone);
	addLine("p", "n2", hexCone);
	addLine("p", "n3", hexCone);
	addLine("p", "n4", hexCone);

	addLine("u1", "u2", hexUp);
	addLine("u2", "u3", hexUp);
	addLine("u3", "u1", hexUp);

	addLine("c", "t", hexTarget);
	addLine("p", "c", hexCross);

	addLine("cn1", "cn2", hexCross);
	addLine("cn3", "cn4", hexCross);

	addLine("cf1", "cf2", hexCross);
	addLine("cf3", "cf4", hexCross);

	this.camera = camera;

	function addLine(a, b, hex) {
		addPoint(a, hex);
		addPoint(b, hex);
	}

	function addPoint(id, hex) {
		_this.lineGeometry.vertices.push(new Vector3());
		_this.lineGeometry.colors.push(new Color(hex));

		if (_this.pointMap[id] === undefined) _this.pointMap[id] = [];
		_this.pointMap[id].push(_this.lineGeometry.vertices.length - 1);
	}

	this.update(camera);

	this.lines = new Line(this.lineGeometry, this.lineMaterial, LinePieces);
	this.add(this.lines);
};

CameraHelper.prototype = new Object3D();
CameraHelper.prototype.constructor = CameraHelper;

CameraHelper.prototype.update = function () {
	var camera = this.camera;

	var w = 1;
	var h = 1;

	var _this = this;

	CameraHelper.__c.projectionMatrix.copy(camera.projectionMatrix);

	setPoint("c", 0, 0, -1);
	setPoint("t", 0, 0,  1);

	setPoint("n1", -w, -h, -1);
	setPoint("n2",  w, -h, -1);
	setPoint("n3", -w,  h, -1);
	setPoint("n4",  w,  h, -1);

	setPoint("f1", -w, -h, 1);
	setPoint("f2",  w, -h, 1);
	setPoint("f3", -w,  h, 1);
	setPoint("f4",  w,  h, 1);

	setPoint("u1",  w * 0.7, h * 1.1, -1);
	setPoint("u2", -w * 0.7, h * 1.1, -1);
	setPoint("u3",        0, h * 2,   -1);

	setPoint("cf1", -w,  0, 1);
	setPoint("cf2",  w,  0, 1);
	setPoint("cf3",  0, -h, 1);
	setPoint("cf4",  0,  h, 1);

	setPoint("cn1", -w,  0, -1);
	setPoint("cn2",  w,  0, -1);
	setPoint("cn3",  0, -h, -1);
	setPoint("cn4",  0,  h, -1);

	function setPoint(point, x, y, z) {
		CameraHelper.__v.set(x, y, z);
		CameraHelper.__projector.unprojectVector(CameraHelper.__v, CameraHelper.__c);

		var points = _this.pointMap[point];

		if (points !== undefined) {
			for (var i = 0, il = points.length; i < il; i ++) {
				var j = points[i];
				_this.lineGeometry.vertices[j].copy(CameraHelper.__v);
			}
		}
	}

	this.lineGeometry.verticesNeedUpdate = true;
};

CameraHelper.__projector = new Projector();
CameraHelper.__v = new Vector3();
CameraHelper.__c = new Camera();