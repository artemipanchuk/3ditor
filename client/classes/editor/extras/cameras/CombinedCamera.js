CombinedCamera = function (width, height, fov, near, far, orthonear, orthofar) {
	Camera.call(this);

	this.fov = fov;
	this.left = -width / 2;
	this.right = width / 2
	this.top = height / 2;
	this.bottom = -height / 2;
	this.cameraO = new OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 	orthonear, orthofar);
	this.cameraP = new PerspectiveCamera(fov, width/height, near, far);

	this.zoom = 1;
	this.toPerspective();
	var aspect = width/height;
};

CombinedCamera.prototype = new Camera();
CombinedCamera.prototype.constructor = CombinedCamera;

CombinedCamera.prototype.toPerspective = function () {
	this.near = this.cameraP.near;
	this.far = this.cameraP.far;
	this.cameraP.fov =  this.fov / this.zoom ;
	this.cameraP.updateProjectionMatrix();
	this.projectionMatrix = this.cameraP.projectionMatrix;
	this.inPersepectiveMode = true;
	this.inOrthographicMode = false;
};

CombinedCamera.prototype.toOrthographic = function () {
	var fov = this.fov;
	var aspect = this.cameraP.aspect;
	var near = this.cameraP.near;
	var far = this.cameraP.far;
	var hyperfocus = (near + far) / 2; 
	var halfHeight = Math.tan(fov / 2) * hyperfocus;
	var planeHeight = 2 * halfHeight;
	var planeWidth = planeHeight * aspect;
	var halfWidth = planeWidth / 2;
	halfHeight /= this.zoom;
	halfWidth /= this.zoom;
	this.cameraO.left = -halfWidth;
	this.cameraO.right = halfWidth;
	this.cameraO.top = halfHeight;
	this.cameraO.bottom = -halfHeight;
	this.cameraO.updateProjectionMatrix();

	this.near = this.cameraO.near;
	this.far = this.cameraO.far;
	this.projectionMatrix = this.cameraO.projectionMatrix;
	this.inPersepectiveMode = false;
	this.inOrthographicMode = true;
};

CombinedCamera.prototype.setSize = function(width, height) {
	this.cameraP.aspect = width / height;
	this.left = -width / 2;
	this.right = width / 2
	this.top = height / 2;
	this.bottom = -height / 2;
}

CombinedCamera.prototype.setFov = function(fov) {	
	this.fov = fov;
	if (this.inPersepectiveMode) {
		this.toPerspective();
	} else {
		this.toOrthographic();
	}
};
CombinedCamera.prototype.updateProjectionMatrix = function() {
	if (this.inPersepectiveMode) {
		this.toPerspective();
	} else {
		this.toPerspective();
		this.toOrthographic();
	}
};

CombinedCamera.prototype.setLens = function (focalLength, frameHeight) {
	frameHeight = frameHeight !== undefined ? frameHeight : 24;

	var fov = 2 * Math.atan(frameHeight / (focalLength * 2)) * (180 / Math.PI);

	this.setFov(fov);

	return fov;
};

CombinedCamera.prototype.setZoom = function(zoom) {
	this.zoom = zoom;
	if (this.inPersepectiveMode) {
		this.toPerspective();
	} else {
		this.toOrthographic();
	}
};

CombinedCamera.prototype.toFrontView = function() {
	this.rotation.x = 0;
	this.rotation.y = 0;
	this.rotation.z = 0;
	this.rotationAutoUpdate = false;
};

CombinedCamera.prototype.toBackView = function() {
	this.rotation.x = 0;
	this.rotation.y = Math.PI;
	this.rotation.z = 0;
	this.rotationAutoUpdate = false;
};
CombinedCamera.prototype.toLeftView = function() {
	this.rotation.x = 0;
	this.rotation.y = - Math.PI / 2;
	this.rotation.z = 0;
	this.rotationAutoUpdate = false;
};

CombinedCamera.prototype.toRightView = function() {
	this.rotation.x = 0;
	this.rotation.y = Math.PI / 2;
	this.rotation.z = 0;
	this.rotationAutoUpdate = false;
};

CombinedCamera.prototype.toTopView = function() {
	this.rotation.x = - Math.PI / 2;
	this.rotation.y = 0;
	this.rotation.z = 0;
	this.rotationAutoUpdate = false;
};

CombinedCamera.prototype.toBottomView = function() {
	this.rotation.x = Math.PI / 2;
	this.rotation.y = 0;
	this.rotation.z = 0;
	this.rotationAutoUpdate = false;
};