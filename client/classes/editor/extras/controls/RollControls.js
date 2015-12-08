RollControls = function (object, domElement) {
	this.object = object;
	this.domElement = (domElement !== undefined) ? domElement : document;

	this.mouseLook = true;
	this.autoForward = false;

	this.lookSpeed = 1;
	this.movementSpeed = 1;
	this.rollSpeed = 1;

	this.constrainVertical = [-0.9, 0.9];

	this.object.matrixAutoUpdate = false;

	this.forward = new Vector3(0, 0, 1);
	this.roll = 0;

	var xTemp = new Vector3();
	var yTemp = new Vector3();
	var zTemp = new Vector3();
	var rollMatrix = new Matrix4();

	var doRoll = false, rollDirection = 1, forwardSpeed = 0, sideSpeed = 0, upSpeed = 0;

	var mouseX = 0, mouseY = 0;

	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;

	this.update = function (delta) {
		if (this.mouseLook) {
			var actualLookSpeed = delta * this.lookSpeed;

			this.rotateHorizontally(actualLookSpeed * mouseX);
			this.rotateVertically(actualLookSpeed * mouseY);
		}

		var actualSpeed = delta * this.movementSpeed;
		var forwardOrAuto = (forwardSpeed > 0 || (this.autoForward && ! (forwardSpeed < 0))) ? 1 : forwardSpeed;

		this.object.translateZ(-actualSpeed * forwardOrAuto);
		this.object.translateX(actualSpeed * sideSpeed);
		this.object.translateY(actualSpeed * upSpeed);

		if(doRoll) {
			this.roll += this.rollSpeed * delta * rollDirection;
		}

		if(this.forward.y > this.constrainVertical[1]) {
			this.forward.y = this.constrainVertical[1];
			this.forward.normalize();
		} else if(this.forward.y < this.constrainVertical[0]) {
			this.forward.y = this.constrainVertical[0];
			this.forward.normalize();
		}

		zTemp.copy(this.forward);
		yTemp.set(0, 1, 0);

		xTemp.cross(yTemp, zTemp).normalize();
		yTemp.cross(zTemp, xTemp).normalize();

		this.object.matrix.elements[0] = xTemp.x; this.object.matrix.elements[4] = yTemp.x; this.object.matrix.elements[8] = zTemp.x;
		this.object.matrix.elements[1] = xTemp.y; this.object.matrix.elements[5] = yTemp.y; this.object.matrix.elements[9] = zTemp.y;
		this.object.matrix.elements[2] = xTemp.z; this.object.matrix.elements[6] = yTemp.z; this.object.matrix.elements[10] = zTemp.z;

		rollMatrix.identity();
		rollMatrix.elements[0] = Math.cos(this.roll); rollMatrix.elements[4] = -Math.sin(this.roll);
		rollMatrix.elements[1] = Math.sin(this.roll); rollMatrix.elements[5] =  Math.cos(this.roll);

		this.object.matrix.multiplySelf(rollMatrix);
		this.object.matrixWorldNeedsUpdate = true;

		this.object.matrix.elements[12] = this.object.position.x;
		this.object.matrix.elements[13] = this.object.position.y;
		this.object.matrix.elements[14] = this.object.position.z;
	};

	this.translateX = function (distance) {
		this.object.position.x += this.object.matrix.elements[0] * distance;
		this.object.position.y += this.object.matrix.elements[1] * distance;
		this.object.position.z += this.object.matrix.elements[2] * distance;
	};

	this.translateY = function (distance) {
		this.object.position.x += this.object.matrix.elements[4] * distance;
		this.object.position.y += this.object.matrix.elements[5] * distance;
		this.object.position.z += this.object.matrix.elements[6] * distance;
	};

	this.translateZ = function (distance) {
		this.object.position.x -= this.object.matrix.elements[8] * distance;
		this.object.position.y -= this.object.matrix.elements[9] * distance;
		this.object.position.z -= this.object.matrix.elements[10] * distance;
	};

	this.rotateHorizontally = function (amount) {
		xTemp.set(this.object.matrix.elements[0], this.object.matrix.elements[1], this.object.matrix.elements[2]);
		xTemp.multiplyScalar(amount);

		this.forward.subSelf(xTemp);
		this.forward.normalize();
	};

	this.rotateVertically = function (amount) {
		yTemp.set(this.object.matrix.elements[4], this.object.matrix.elements[5], this.object.matrix.elements[6]);
		yTemp.multiplyScalar(amount);

		this.forward.addSelf(yTemp);
		this.forward.normalize();
	};

	function onKeyDown(event) {
		switch(event.keyCode) {
			case 38: 
			case 87:  forwardSpeed = 1; break;

			case 37: 
			case 65:  sideSpeed = -1; break;

			case 40: 
			case 83:  forwardSpeed = -1; break;

			case 39: 
			case 68:  sideSpeed = 1; break;

			case 81:  doRoll = true; rollDirection = 1; break;
			case 69:  doRoll = true; rollDirection = -1; break;

			case 82:  upSpeed = 1; break;
			case 70:  upSpeed = -1; break;
		}
	};

	function onKeyUp(event) {
		switch(event.keyCode) {
			case 38: 
			case 87:  forwardSpeed = 0; break;

			case 37: 
			case 65:  sideSpeed = 0; break;

			case 40: 
			case 83:  forwardSpeed = 0; break;

			case 39: 
			case 68:  sideSpeed = 0; break;

			case 81:  doRoll = false; break;
			case 69:  doRoll = false; break;

			case 82:  upSpeed = 0; break;
			case 70:  upSpeed = 0; break;
		}
	};

	function onMouseMove(event) {
		mouseX = (event.clientX - windowHalfX) / window.innerWidth;
		mouseY = (event.clientY - windowHalfY) / window.innerHeight;
	};

	function onMouseDown (event) {
		event.preventDefault();
		event.stopPropagation();

		switch (event.button) {
			case 0: forwardSpeed = 1; break;
			case 2: forwardSpeed = -1; break;
		}
	};

	function onMouseUp (event) {
		event.preventDefault();
		event.stopPropagation();

		switch (event.button) {
			case 0: forwardSpeed = 0; break;
			case 2: forwardSpeed = 0; break;
		}
	};

	this.domElement.addEventListener('contextmenu', function (event) { event.preventDefault(); }, false);

	this.domElement.addEventListener('mousemove', onMouseMove, false);
	this.domElement.addEventListener('mousedown', onMouseDown, false);
	this.domElement.addEventListener('mouseup', onMouseUp, false);
	this.domElement.addEventListener('keydown', onKeyDown, false);
	this.domElement.addEventListener('keyup', onKeyUp, false);
};